import sys
import io
import re
import math
import time
import ctypes
import struct
from copy import deepcopy
from functools import lru_cache
import os

class BufferOutput:

    def __init__(self, cols=70):
        self.cols = cols
        self.lines = []
        self.x = 0
        self.y = 0

    def write(self, text):
        while len(self.lines) <= self.y:
            self._append_line()
        line = self.lines[self.y]

        for tok, value in _parse_ansi(text):
            if tok == 'nl':
                self.y += 1
                self.x = 0
                if len(self.lines) <= self.y:
                    self._append_line()
                line = self.lines[self.y]
            elif tok == 'cr':
                self.x = 0
            elif tok == 'up':
                self.y = max(0, self.y - value)
                line = self.lines[self.y]
            elif tok == 'down':
                self.y = min(len(self.lines)-1, self.y + value)
                line = self.lines[self.y]
            elif tok == 'ch':
                line.seek(self.x)
                max_len = self.cols - self.x
                if len(value) > max_len:
                    value = value[:max_len]
                line.write(value)
                self.x += len(value)
            # other tokens are ignored

    def flush(self):
        pass

    def getvalue(self):
        return "\n".join([line.getvalue().rstrip() for line in self.lines])

    def _append_line(self):
        self.lines.append(io.StringIO(str(" " * self.cols)))


def _parse_ansi(text):
    chars = io.StringIO()
    tok = None
    ix = 0
    while ix < len(text):
        if text[ix:].startswith("\033["):
            res1 = re.match(r"^([0-9]*)([AB])", text[ix+2:])
            res2 = re.match(r"^([0-9;]*)m", text[ix+2:])

            if res1:
                length = res1.end() - res1.start() + 2
                value = int(res1.group(1))
                if res1.group(2) == 'A':
                    tok = ('up', value)
                else:
                    tok = ('down', value)
                ix += length
            elif res2:
                length = res2.end() - res2.start() + 2
                value = res2.group(1)
                tok = ('color', value)
                ix += length
            else:
                chars.write(text[ix])
                ix += 1

        elif text[ix] == "\n":
            tok = ('nl', None)
            ix += 1
        elif text[ix] == "\r":
            tok = ('cr', None)
            ix += 1
        else:
            chars.write(text[ix])
            ix += 1

        if tok:
            if len(chars.getvalue()):
                yield ('ch', chars.getvalue())
                chars = io.StringIO()

            yield tok
            tok = None

    if len(chars.getvalue()):
        yield ('ch', chars.getvalue())


class ProgressBar:

    def __init__(self,
                 iterable=None,
                 epochs=None,
                 steps=None,
                 title=None,
                 style='default',
                 label="it",
                 file=sys.stdout,
                 width=70,
                 color=None,
                 keep=True,
                 show=True,
                 post=None):
        assert hasattr(iterable, '__len__') or steps is not None
        assert (isinstance(style, str) and len(style) == 1) or \
               isinstance(style, list) or \
               style in ('default', 'ascii', 'consolas')
        
        if style == 'default':
            self.style = ["", "▏","▎","▍","▌","▋","▊","▉","█"]
        elif style == 'consolas':
            self.style = ["", "▌","▌","▌","▌","█","█","█","█"]
        elif style == 'ascii':
            self.style = ["", "1","2","3","4","5","6","7","8","9","#"]
        elif isinstance(style, str):
            self.style = ["", "1","2","3","4","5","6","7","8","9", style]  
        else:
            self.style = style
        
        self.steps = steps if steps is not None else len(iterable)
        self.iterable = iter(iterable) if iterable else None
        self.epochs = epochs
        self.current_epoch = 0
        self.started = False
        self.step = 0
        self.file = file
        self.title = title
        self.label = label
        self.width = width
        self.last_it = []
        self.color = color
        self.it_per_sec = "-".rjust(6)
        self.keep = keep
        self.show = show
        self.post = post

    def start(self):
        if not self.started:
            self.started = True
            self.display()
    
    def stop(self):
        if self.show:
            if self.keep:
                print("", file=self.file)
            else:
                self.file.write("\r")
                self.file.write(str(" " * self.width))
                self.file.write("\r")
                self.file.flush()

    def __iter__(self):
        assert self.iterable
        assert not self.epochs, "total epochs not supported when used as iterator"
        return self
    
    def __next__(self):
        self.start()
        self._calc_it_per_sec()
        self.step += 1
        self.display()
        try:
            return next(self.iterable)
        except StopIteration as err:
            self.stop()
            raise err
    
    def _calc_it_per_sec(self):
        now = time.time()
        
        if not self.last_it:
            self.last_it.append(now)
        else:
            self.last_it.append(now)
            if len(self.last_it) >= 100:
                self.last_it = self.last_it[-100:]

            # smooth it/sec
            intervals = list(map(lambda t: t[1] - t[0], zip(self.last_it[:-1], self.last_it[1:])))
            delta = sum(intervals) / len(intervals)
            if delta != 0.:
                it_per_sec = 1.0 / delta
                if it_per_sec > 1_000_00:
                    self.it_per_sec = "{}M".format(int(it_per_sec/1_000_000))
                elif it_per_sec > 1_000:
                    self.it_per_sec = "{}K".format(int(it_per_sec/1_000))
                else:
                    self.it_per_sec = "{:.2f}".format(it_per_sec)
                # 6 characters so the progress bar is the same size
                self.it_per_sec = self.it_per_sec.rjust(6)
                # self.last_it = now

    def display(self):
        if not self.started or not self.show:
            return
        step = min(self.steps, self.step+1)
        
        buffer = io.StringIO()
        perc = step / self.steps
        pre = self.title
        if not pre and self.epochs:
            epoch = min(self.current_epoch + 1, self.epochs)
            pre = "Epoch " + str(epoch).rjust(len(str(self.epochs))) + "/" + str(self.epochs)
        if not pre:
        # use percentage
            pre = '{:>3}%'.format(int(perc * 100))
        
        
        if self.post:
            post = self.post()
        else:
            post = " " + str(step).rjust(len(str(self.steps))) + "/" + str(self.steps)
            post += " [" + (self.it_per_sec or "-") + " " + self.label + "/sec]" 

        bar_length = self.width - len(pre) - len(post) - 2 # 2 = separators

        v = perc * bar_length
        x = math.floor(v) # integer part
        y = v - x         # fractional part
        base = 1 / (len(self.style) - 1)
        prec = 3
        i = int(round(base*math.floor(float(y)/base),prec)/base)
        bar = "" + self.style[-1]*x + self.style[i]
        n = bar_length-len(bar)
        bar = bar + " "*n
        if self.color:
            bar = f"\033[{self.color}m{bar}\033[0m"
            
        buffer.write("\r")
        buffer.write(pre)
        buffer.write('|')
        buffer.write(bar)
        buffer.write("|")
        buffer.write(post)

        self.file.write(buffer.getvalue())
        self.file.flush()
      

    def update(self, step=None, epoch=None):
        self._calc_it_per_sec()
        if step is not None:
            self.step = step
        
        if epoch is not None:
            self.current_epoch = epoch
        
        self.display()


_DEFAULT_HEIGHT = 24
_DEFAULT_WIDTH = 79
if os.name == 'nt':
    # code borrowed from colorama and package_control
    # https://github.com/tartley/colorama/blob/master/colorama/win32.py
    # https://github.com/wbond/package_control/blob/master/package_control/processes.py
    
    import ctypes
    from ctypes import LibraryLoader
    windll = LibraryLoader(ctypes.WinDLL)
    from ctypes import wintypes, byref, Structure, POINTER, c_ulong, c_buffer, sizeof, cast
    COORD = wintypes._COORD

    _LF_FACESIZE = 32

    class CONSOLE_SCREEN_BUFFER_INFO(Structure):
        """struct in wincon.h."""
        _fields_ = [
            ("dwSize", COORD),
            ("dwCursorPosition", COORD),
            ("wAttributes", wintypes.WORD),
            ("srWindow", wintypes.SMALL_RECT),
            ("dwMaximumWindowSize", COORD),
        ]
    
    class CONSOLE_FONT_INFOEX(Structure):
        _fields_ = [
            ("cbSize", wintypes.ULONG),
            ("nFont", wintypes.DWORD),
            ("dwFontSize", COORD),
            ("FontFamily", wintypes.UINT),
            ("FontWeight", wintypes.UINT),
            ("FaceName", wintypes.WCHAR * _LF_FACESIZE)
        ]

    class WINAPI:
        
        _GetStdHandle = windll.kernel32.GetStdHandle
        _GetStdHandle.argtypes = [wintypes.DWORD]
        _GetStdHandle.restype = wintypes.HANDLE

        _GetConsoleScreenBufferInfo = windll.kernel32.GetConsoleScreenBufferInfo
        _GetConsoleScreenBufferInfo.argtypes = [wintypes.HANDLE, POINTER(CONSOLE_SCREEN_BUFFER_INFO)]
        _GetConsoleScreenBufferInfo.restype = wintypes.BOOL

        _EnumProcesses = windll.psapi.EnumProcesses
        _EnumProcesses.argtypes = [wintypes.PDWORD, wintypes.DWORD, wintypes.PDWORD]
        _EnumProcesses.restype = wintypes.BOOL

        _EnumProcessModules = windll.psapi.EnumProcessModules
        _EnumProcessModules.argtypes = [wintypes.HANDLE, POINTER(wintypes.HANDLE), wintypes.DWORD, POINTER(wintypes.LPDWORD)]
        _EnumProcessModules.restype = wintypes.BOOL

        _OpenProcess = windll.kernel32.OpenProcess
        _OpenProcess.argtypes = [wintypes.DWORD, wintypes.BOOL, wintypes.DWORD]
        _OpenProcess.restype = wintypes.HANDLE

        _CloseHandle = windll.kernel32.CloseHandle
        _CloseHandle.argtypes = [wintypes.HANDLE]
        _CloseHandle.restype = wintypes.BOOL

        _GetModuleBaseNameW = windll.psapi.GetModuleBaseNameW
        _GetModuleBaseNameW.argtypes = [wintypes.HANDLE, wintypes.HANDLE, wintypes.LPWSTR, wintypes.DWORD]
        _GetModuleBaseNameW.restype = wintypes.DWORD

        _GetConsoleMode = windll.kernel32.GetConsoleMode
        _GetConsoleMode.argtypes = [wintypes.HANDLE, wintypes.LPDWORD]
        _GetConsoleMode.restype = wintypes.BOOL

        _SetConsoleMode = windll.kernel32.SetConsoleMode
        _SetConsoleMode.argtypes = [wintypes.HANDLE, wintypes.DWORD]
        _SetConsoleMode.restype = wintypes.BOOL

        _GetCurrentConsoleFontEx = windll.kernel32.GetCurrentConsoleFontEx
        _GetCurrentConsoleFontEx.argtypes = [wintypes.HANDLE, wintypes.BOOL, POINTER(CONSOLE_FONT_INFOEX)]
        _GetCurrentConsoleFontEx.restype = wintypes.BOOL

        _PROCESS_QUERY_INFORMATION = 0x0400
        _PROCESS_VM_READ = 0x0010
        _ENABLE_VIRTUAL_TERMINAL_PROCESSING = 0x0004
        
        
        _STDOUT = -11
        _STDERR = -12

        @staticmethod
        @lru_cache()
        def winapi_test():
            def _winapi_test(handle):
                csbi = CONSOLE_SCREEN_BUFFER_INFO()
                success = WINAPI._GetConsoleScreenBufferInfo(
                    handle, byref(csbi))
                return bool(success)

            return any(_winapi_test(h) for h in
                    (WINAPI._GetStdHandle(WINAPI._STDOUT), WINAPI._GetStdHandle(WINAPI._STDERR)))
        
        @staticmethod
        @lru_cache()
        def get_ppname():
            process_id_array_size = 1024
            entries = 0

            while entries == 0 or process_id_array_size == entries:
                dword_array = (wintypes.DWORD * process_id_array_size)

                process_ids = dword_array()
                bytes_used = wintypes.DWORD(0)

                res = WINAPI._EnumProcesses(cast(process_ids, wintypes.PDWORD), sizeof(process_ids), byref(bytes_used))
                if not res:
                    return []

                entries = int(bytes_used.value / sizeof(wintypes.DWORD))
                process_id_array_size += 512

            name = None
            index = 0
            ppid = os.getppid()
            while index < entries:
                process_id = process_ids[index]
                if ppid != process_id:
                    index += 1
                    continue
                
                
                process_handle = WINAPI._OpenProcess(WINAPI._PROCESS_QUERY_INFORMATION | WINAPI._PROCESS_VM_READ, False, process_id)
                if process_handle:
                    module = wintypes.HANDLE()
                    needed_bytes = wintypes.LPDWORD()
                    module_res = WINAPI._EnumProcessModules(
                        process_handle,
                        byref(module),
                        sizeof(module),
                        byref(needed_bytes)
                    )
                    if module_res:
                        length = 260
                        buffer = ctypes.create_unicode_buffer(length)
                        WINAPI._GetModuleBaseNameW(process_handle, module, buffer, length)
                        name = buffer.value
                WINAPI._CloseHandle(process_handle)
                break

            return name
        
        @staticmethod
        def _terminal_size(handle):
            csbi = CONSOLE_SCREEN_BUFFER_INFO()
            if not WINAPI._GetConsoleScreenBufferInfo(handle, byref(csbi)):
                raise ctypes.WinError()  # Subclass of OSError.
            else:
                columns = csbi.srWindow.Right - csbi.srWindow.Left + 1
                rows = csbi.srWindow.Bottom - csbi.srWindow.Top + 1
                return columns, rows

        @staticmethod
        def terminal_size():
            """Get the width and height of the terminal.
            http://code.activestate.com/recipes/440694-determine-size-of-console-window-on-windows/
            http://stackoverflow.com/questions/17993814/why-the-irrelevant-code-made-a-difference
            :return: Width (number of characters) and height (number of lines) of the terminal.
            :rtype: tuple
            """
            try:
                return WINAPI._terminal_size(WINAPI._GetStdHandle(WINAPI._STDOUT))
            except OSError:
                try:
                    return WINAPI._terminal_size(WINAPI._GetStdHandle(WINAPI._STDERR))
                except OSError:
                    return _DEFAULT_WIDTH, _DEFAULT_HEIGHT
        
        @staticmethod
        def try_enable_ansi():
            """Try enabling ANSI colors
            https://stackoverflow.com/questions/44482505/setconsolemode-returning-false-when-enabling-ansi-color-under-windows-10"""
            lpMode = wintypes.DWORD()
            handle = WINAPI._GetStdHandle(WINAPI._STDOUT)
            if WINAPI._GetConsoleMode(handle, ctypes.byref(lpMode)):
               
                if not WINAPI._SetConsoleMode(handle, lpMode.value | WINAPI._ENABLE_VIRTUAL_TERMINAL_PROCESSING):
                    return False
            else:
                return False
            
            lpMode = wintypes.DWORD()
            handle = WINAPI._GetStdHandle(WINAPI._STDERR)
            if WINAPI._GetConsoleMode(handle, ctypes.byref(lpMode)):
                if not WINAPI._SetConsoleMode(handle, lpMode.value | WINAPI._ENABLE_VIRTUAL_TERMINAL_PROCESSING):
                    return False
            else:
                return False
            
            return True

        @staticmethod
        @lru_cache()
        def get_font():
            handle = WINAPI._GetStdHandle(WINAPI._STDOUT)
            font = CONSOLE_FONT_INFOEX()
            font.cbSize = sizeof(CONSOLE_FONT_INFOEX)
            if not WINAPI._GetCurrentConsoleFontEx(handle, False, byref(font)):
                return None
            else:
                return font.FaceName

    NIXAPI = None
else:
    WINAPI = None
    class NIXAPI:

        @staticmethod
        def terminal_size():
            try:
                device = __import__('fcntl').ioctl(0, __import__('termios').TIOCGWINSZ, '\0\0\0\0\0\0\0\0')
            except IOError:
                return _DEFAULT_WIDTH, _DEFAULT_HEIGHT
            height, width = struct.unpack('hhhh', device)[:2]
            return width, height

class Terminal:
    
    @lru_cache()
    def is_tty(self):
        return sys.stdout.isatty()

    @lru_cache()
    def is_cmd_exe(self):
        if WINAPI:
            return WINAPI.get_ppname() == "cmd.exe" and WINAPI.winapi_test()
        else:
            return False
        
    @lru_cache()
    def is_powershell(self):
        if WINAPI:
            return WINAPI.get_ppname() == "powershell.exe" and WINAPI.winapi_test()
        else:
            return False
    
    @lru_cache()
    def supports_ansi_escapes(self):
        """Return True if the terminal supports ANSI escape sequences.
        https://unix.stackexchange.com/questions/23763/checking-how-many-colors-my-terminal-emulator-supports
        https://stackoverflow.com/questions/4842424/list-of-ansi-color-escape-sequences
        """
        if not sys.stdout.isatty():
            return False
        elif WINAPI:
            if WINAPI.winapi_test():
                return WINAPI.try_enable_ansi()
            else:
                return True
        else:
            return True
    
    
    def terminal_size(self):
        """Get the width and height of the terminal.
        http://code.activestate.com/recipes/440694-determine-size-of-console-window-on-windows/
        http://stackoverflow.com/questions/17993814/why-the-irrelevant-code-made-a-difference
        :return: Width (number of characters) and height (number of lines) of the terminal.
        :rtype: tuple
        """
        if WINAPI:
            return WINAPI.terminal_size()
        else:
            return NIXAPI.terminal_size()

TERMINAL = Terminal()

class Table:

    def __init__(self, data, style='default', separate='header', terminal=TERMINAL, pad=1, left_align=set()):
        assert separate in ('header', 'row', 'none')
        assert style in ('default', 'ascii', 'no-round')
        self.style = style
        self.separate = separate
        self.pad = pad

        # make all rows the same length
        max_data = max(map(len, data))
       
        for row in data:
            if len(row) < max_data:
                row.extend([""] * (max_data - len(row)))
        self._original_data = deepcopy(data)
        
        self.data = data
        
        for ix in range(max_data):
            
            col_size = max(map(lambda r: len(str(r[ix])), self.data))
            for j, row in enumerate(self.data) or ix in left_align:
                if j == 0 or ix in left_align:
                    row[ix] = str(" " * pad) + str(row[ix]).ljust(col_size) + str(" " * pad)
                else:
                    row[ix] = str(" " * pad) + str(row[ix]).rjust(col_size) + str(" " * pad)
        self.terminal = terminal
        self.left_align = left_align
            
    def __str__(self):
        return self.getvalue(fit=False)

    def getvalue(self, fit=True):

        buffer = io.StringIO()
        if len(self.data) >= 1:
            first_draw_bottom = len(self.data) == 1 or self.separate in ('header', 'row')
            self._print_row(self.data[0], buffer, draw_top=True, draw_bottom=first_draw_bottom, is_first=True, 
                            is_last=len(self.data) == 1, is_connected=len(self.data) != 1)
            first_line = buffer.getvalue().splitlines()[0]

            # if the table width is more than the terminal width, reduce the columns by 1
            if len(first_line) > self.terminal.terminal_size()[0] and len(self._original_data[0]) > 1:
                data_ = [d[:-1] for d in self._original_data]
                table = Table(data_, style=self.style, separate=self.separate, terminal=self.terminal, pad=self.pad, left_align=self.left_align)
                return table.getvalue(fit)

            for row in self.data[1:-1]:
                self._print_row(row, buffer, draw_top=False, draw_bottom=self.separate == 'row', is_first=False, 
                                is_last=False, is_connected=self.separate == 'row')
            if len(self.data) > 1:
                self._print_row(self.data[-1], buffer, draw_top=False, draw_bottom=True, is_first=False, 
                                is_last=True, is_connected=False)
        
        if self.style == 'default':
            res = buffer.getvalue()
        elif self.style == 'no-round':
            res = buffer.getvalue()
            res = res.replace("╭", '┌')
            res = res.replace("╮", '┐')
            res = res.replace("╰", '└')
            res = res.replace("╯", "┘")
        elif self.style == 'ascii':
            res = buffer.getvalue()
            res = res.replace("╭", '+')
            res = res.replace("╮", '+')
            res = res.replace("╰", '+')
            res = res.replace("╯", "+")
            res = res.replace("├", "+")
            res = res.replace("┬", "+")
            res = res.replace("┤", "+")
            res = res.replace("┼", "+")
            res = res.replace("┴", "+")
            res = res.replace("─", "-")
            res = res.replace("│", "|")
            
        return res

    def _print_row(self, row, file, draw_top, draw_bottom, is_first, is_last, is_connected):
        
        # draw top line
        if draw_top:
            file.write("╭" if is_first else "├")
            for col in row[:-1]:
                file.write(str("─" * len(col)))
                file.write("┬")
            file.write(str("─" * len(row[-1])))
            file.write("╮")
            file.write("\n")
        
        # draw content
        file.write("│")
        for col in row:
            file.write(col)
            file.write("│")
        file.write("\n")

        # draw bottom line
        if draw_bottom:
            file.write("╰" if is_last else "├")
            for col in row[:-1]:
                file.write(str("─" * len(col)))
                file.write("┼" if is_connected else "┴")
            file.write(str("─" * len(row[-1])))
            file.write("┤" if is_connected else "╯")
            if not is_last:
                file.write("\n")

class StatsTable:

    def __init__(self, conf, width=70, pad=4, left_align=set()):
        self.conf = conf
        self.data = {}
        self.width = width
        self.pad = pad
        self.left_align = left_align

        self.by_cat = {}
        self.cats = []
        self.titles = []

        for item in self.conf:
            self.by_cat.setdefault(item['category'], {})

            if not item['category'] in self.cats:
                self.cats.append(item['category'])

            if not item['title'] in self.titles:
                self.titles.append(item['title'])
            
            self.by_cat[item['category']][item['title']] = (item['name'], item['format'])
    
    def update(self, data):
        for k,v in data.items():
            self.data[k] = v
    
    def __str__(self):
        return self.getvalue()
        
    def getvalue(self):
        
        title_row = [""]
        title_row.extend(self.titles)
        cat_rows = []
       

        for cat in self.cats:
            row = [cat]
            for title in self.titles:
                name, fmt = self.by_cat[cat][title]
                if name in self.data:
                    value = self.data[name]
                    fmt = "{:" +  fmt.lstrip("{").rstrip("}").lstrip(":") + "}"
                    row.append(fmt.format(value))
                else:
                    row.append("-")
            cat_rows.append(row)
        
        data = [title_row] + cat_rows
      
        t = Table(data, left_align=self.left_align)
        return t.getvalue(fit=False) + "\n"

class Display:

    def __init__(self,
                 highlight_color=36,
                 table_style='default',
                 progress_style='default', 
                 is_interactive=True,
                 stdout=sys.stdout, 
                 stderr=sys.stderr):
        self.stdout = stdout
        self.stderr = stderr
        self.highlight_color = highlight_color
        self.table_style = table_style
        self.progress_style = progress_style
        self.is_interactive = is_interactive
        self.cursor_hidden = False
        self.quiet = False
    
    def table(self, data, style=None, separate='header', terminal=TERMINAL, pad=1, left_align=set()):
        if not style:
            style = self.table_style
        return Table(data=data, style=style, separate=separate, terminal=terminal, pad=pad, left_align=left_align)
    
    def stats_table(self, conf, width=70, pad=4, left_align=set()):
        return StatsTable(conf=conf, width=width, pad=pad, left_align=left_align)
    
    def progressbar(self,
                    iterable=None,
                    steps=None,
                    title=None,
                    epochs=None,
                    style=None,
                    label="it",
                    file=sys.stdout,
                    width=70,
                    color=None,
                    keep=True,
                    show=None,
                    post=None):
        if style is None:
            style = self.progress_style
        
        if color is None:
            color = self.highlight_color
        
        if show is None:
            show = self.is_interactive
        
        return ProgressBar(iterable,
                           steps=steps,
                           title=title,
                           epochs=epochs,
                           style=style,
                           label=label,
                           file=self.stdout,
                           width=width,
                           color=color,
                           keep=keep,
                           show=show,
                           post=post)
    
    def training_feedback(self, stats, steps=None, display_progress='epochs-steps', epochs=None):

        return TrainingFeedback(stats=stats, 
                                steps=steps, 
                                display_progress=display_progress,
                                epochs=epochs,
                                display=self,
                                show=self.is_interactive)

    def print(self, *args):
        if not self.quiet:
            print(*args, file=self.stdout)
    
    def write(self, string):
        if not self.quiet:
            self.stdout.write(string)
    
    def hide_cursor(self):
        if self.is_interactive and not self.cursor_hidden:
            self.cursor_hidden = True
            self.stdout.write("\033[?25l")
            self.stdout.flush()

    def unhide_cursor(self):
        if self.is_interactive and self.cursor_hidden:
            self.cursor_hidden = False
            self.stdout.write("\033[?25h")
            self.stdout.flush()
    
    def cleanup(self):
        if self.cursor_hidden:
            self.unhide_cursor()


_highlight_color=36
_table_style='default'
_progress_style='default'
_is_interactive=True

if TERMINAL.is_tty() and TERMINAL.supports_ansi_escapes():
    if TERMINAL.supports_ansi_escapes():
        if WINAPI:
            font = WINAPI.get_font()
            if font == 'Consolas' or font == 'Lucida Console':
                _progress_style = 'consolas'
            if font == 'Lucida Console':
                _table_style = 'no-round'
else:
    _highlight_color=None
    _table_style='ascii'
    _progress_style='ascii'
    _is_interactive=False

DISPLAY = Display(highlight_color=_highlight_color,
                  table_style=_table_style,
                  progress_style=_progress_style, 
                  is_interactive=_is_interactive)


class TrainingFeedback:

    def __init__(self, epochs=None, steps=None, display_progress='epochs-steps', stats=[], show=True, display=DISPLAY):
        assert display_progress in ('epochs', 'steps', 'epochs-steps')

        self.steps = steps
        self.stats = stats
        self.epochs = epochs
        self.display_progress = display_progress
        self.stats_table = None
        self.progress_bar = None
        self.stats_table_height = None
        self.did_start = False
        self.display = display
        self.steps_timing = []
        self.show = show

    def start(self):
        if self.did_start:
            return
        
        self.display.hide_cursor()

        self.did_start = True
        
        self.stats_table = self.display.stats_table(self.stats, left_align=set([0]))
        if self.display_progress == 'epochs-steps':
            label = "steps"
        else:
            label = self.display_progress

        self.progress_bar = self.display.progressbar(
            iterable=None,
            steps=self.steps if self.display_progress != 'epochs' else self.epochs,
            epochs=self.epochs,
            label=label,
            show=self.show
        )

        stats_table_str = self.stats_table.getvalue()
        self.stats_table_height = len(stats_table_str.splitlines())
        if self.show:
            self.display.write(stats_table_str)
            self.display.print("")
        
        self.progress_bar.start()
    
    def update(self, epoch=None, step=None, **stats):
        assert self.did_start, "must call start() first"

        if self.display_progress == 'epochs-steps':
            self.steps_timing.append(time.time())
            if len(self.steps_timing) >= 5:
                self.steps_timing = self.steps_timing[-5:]
                intervals = list(map(lambda t: t[1] - t[0], zip(self.steps_timing[:-1], self.steps_timing[1:])))
                avg_intv = sum(intervals) / len(intervals)

                # if a whole epoch is over too fast, switch to an epoch based progress bar
                if self.steps * avg_intv <= 1.5:
                    self.display_progress = 'epochs'

                    self.progress_bar = self.display.progressbar(
                        iterable=None,
                        steps=self.epochs * self.steps,
                        epochs=self.epochs,
                        label="steps",
                        show=self.show
                    )
                    self.progress_bar.start()

        self.stats_table.update(stats)
        if self.show:
            self.display.stdout.write("\r")
            self.display.stdout.write("\033[" + str(self.stats_table_height + 1) + "A")
            self.display.write(self.stats_table.getvalue())
            self.display.print("")

        if self.display_progress == 'epochs-steps':
            if step is not None and epoch is not None and epoch < self.epochs and step != self.steps * self.epochs:
                self.progress_bar.update(epoch=epoch, step=step % self.steps)
        elif self.display_progress == 'epochs':
            if step is not None and epoch is not None:
                self.progress_bar.update(epoch=epoch, step=step)
        elif self.display_progress == 'steps':
            if step is not None:
                self.progress_bar.update(epoch=None, step=step)
        
    
    def stop(self):
        self.progress_bar.stop()
        self.display.unhide_cursor()