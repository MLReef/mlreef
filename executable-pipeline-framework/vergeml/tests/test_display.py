from vergeml.display import _parse_ansi, BufferOutput, ProgressBar, Table, Display, StatsTable
import time
import re

def test_parse_chars():
    assert list(_parse_ansi("Hello World!")) == [('ch', 'Hello World!')]

def test_parse_newline():
    assert list(_parse_ansi("Hello World!\n")) == [('ch', 'Hello World!'), ('nl', None)]

def test_parse_newline_cr():
    assert list(_parse_ansi("Hello World!\rHallo Welt!!!\n")) == [('ch', 'Hello World!'), ('cr', None), ('ch', 'Hallo Welt!!!'), ('nl', None)]

def test_parse_up():
    assert list(_parse_ansi("Hello!\033[10ABye!\n")) == [('ch', 'Hello!'), ('up', 10), ('ch', 'Bye!'), ('nl', None)]

def test_parse_down():
    assert list(_parse_ansi("Hello!\033[1BBye!\n")) == [('ch', 'Hello!'), ('down', 1), ('ch', 'Bye!'), ('nl', None)]

def test_parse_comb():
    assert list(_parse_ansi("Hello!\033[1B\033[2ABye!")) == [('ch', 'Hello!'), ('down', 1), ('up', 2), ('ch', 'Bye!')]

def test_buffero():
    buffer = BufferOutput()
    print("Hello World!", file=buffer)
    assert buffer.getvalue() == "Hello World!\n"

def test_buffero_long():
    buffer = BufferOutput()
    print("XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX-YYYYYYYYYYYYYYYYYYYYY", file=buffer)
    assert buffer.getvalue() == "XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX\n"

def test_buffero_multiline():
    buffer = BufferOutput()
    print("Hello World 1!", file=buffer)
    print("Hello World 2!", file=buffer)
    print("Hello World 3!", file=buffer)
    assert buffer.getvalue() == "Hello World 1!\nHello World 2!\nHello World 3!\n"

def test_buffero_cr():
    buffer = BufferOutput()
    buffer.write("Hello World!\rHa\n")
    assert buffer.getvalue() == "Hallo World!\n"

def test_buffero_too_far_up():
    buffer = BufferOutput()
    buffer.write("Hello World!\033[12A!!\n")
    assert buffer.getvalue() == "Hello World!!!\n"

def test_buffero_too_far_down():
    buffer = BufferOutput()
    buffer.write("Hello World!\033[12B!!\n")
    assert buffer.getvalue() == "Hello World!!!\n"

def test_buffero_stats():
    buffer = BufferOutput()
    print("Accuracy: -", file=buffer)
    print("Validation Accuracy: -", file=buffer)
    print("", file=buffer)
    print("Training ...", file=buffer)
    buffer.write("\033[4A")
    print("Accuracy: 0.73", file=buffer)
    print("Validation Accuracy: 0.70", file=buffer)
    assert buffer.getvalue() == "Accuracy: 0.73\nValidation Accuracy: 0.70\n\nTraining ...\n"

def test_progress():
    buffer = BufferOutput()
    progress = ProgressBar(range(100), file=buffer)
    progress.start()
    progress.update(1)
    time.sleep(0.001)
    progress.update(2)
    assert re.match(r'  3%\|█▏                                      \|   3/100 \[[0-9]+\.[0-9][0-9] it/sec\]', buffer.getvalue())
    
def test_table1():
    table = Table([[1,2,3]])
    assert str(table) == """\
╭───┬───┬───╮
│ 1 │ 2 │ 3 │
╰───┴───┴───╯"""

def test_table2():
    table = Table([[1,2,3], [10, 20, 30]])
    assert str(table) == """\
╭────┬────┬────╮
│ 1  │ 2  │ 3  │
├────┼────┼────┤
│ 10 │ 20 │ 30 │
╰────┴────┴────╯"""

def test_table3():
    table = Table([["Accuracy", "Val Accuracy", "Loss", "Val Loss"], [0.89, 0.88, 0.213, 0.334]])
    assert str(table) == """\
╭──────────┬──────────────┬───────┬──────────╮
│ Accuracy │ Val Accuracy │ Loss  │ Val Loss │
├──────────┼──────────────┼───────┼──────────┤
│     0.89 │         0.88 │ 0.213 │    0.334 │
╰──────────┴──────────────┴───────┴──────────╯"""

def test_table4():
    table = Table([["Accuracy", "Val Accuracy", "Loss", "Val Loss"], [0.89, 0.88, 0.213, 0.334], [0.23, 0.89, 0.001, 0.003]])
    assert str(table)  == """\
╭──────────┬──────────────┬───────┬──────────╮
│ Accuracy │ Val Accuracy │ Loss  │ Val Loss │
├──────────┼──────────────┼───────┼──────────┤
│     0.89 │         0.88 │ 0.213 │    0.334 │
│     0.23 │         0.89 │ 0.001 │    0.003 │
╰──────────┴──────────────┴───────┴──────────╯"""

def test_table5():
    table = Table([["Accuracy", "Val Accuracy", "Loss", "Val Loss"], [0.89, 0.88, 0.213, 0.334], [0.23, 0.89, 0.001, 0.003]], separate='row')
    assert str(table) == """\
╭──────────┬──────────────┬───────┬──────────╮
│ Accuracy │ Val Accuracy │ Loss  │ Val Loss │
├──────────┼──────────────┼───────┼──────────┤
│     0.89 │         0.88 │ 0.213 │    0.334 │
├──────────┼──────────────┼───────┼──────────┤
│     0.23 │         0.89 │ 0.001 │    0.003 │
╰──────────┴──────────────┴───────┴──────────╯"""

def test_table6():
    table = Table([["Accuracy", "Val Accuracy", "Loss", "Val Loss"], [0.89, 0.88, 0.213, 0.334], [0.23, 0.89, 0.001, 0.003]], separate='none')
    assert str(table) == """\
╭──────────┬──────────────┬───────┬──────────╮
│ Accuracy │ Val Accuracy │ Loss  │ Val Loss │
│     0.89 │         0.88 │ 0.213 │    0.334 │
│     0.23 │         0.89 │ 0.001 │    0.003 │
╰──────────┴──────────────┴───────┴──────────╯"""

def test_default_table():
    buffer = BufferOutput()
    display = Display(stdout=buffer, stderr=buffer)
    table = display.table([["Accuracy", "Val Accuracy", "Loss", "Val Loss"], [0.89, 0.88, 0.213, 0.334], [0.23, 0.89, 0.001, 0.003]], separate='none')
    assert str(table) == """\
╭──────────┬──────────────┬───────┬──────────╮
│ Accuracy │ Val Accuracy │ Loss  │ Val Loss │
│     0.89 │         0.88 │ 0.213 │    0.334 │
│     0.23 │         0.89 │ 0.001 │    0.003 │
╰──────────┴──────────────┴───────┴──────────╯"""


def test_default_progress():
    buffer = BufferOutput()
    display = Display(stdout=buffer, stderr=buffer)
    progress = display.progressbar(range(100),
                                   epochs=10,
                                   file=buffer)
    progress.start()
    assert buffer.getvalue() == 'Epoch  1/10|▎                                |   1/100 [     - it/sec]'

    progress.update(24)
    assert buffer.getvalue() == 'Epoch  1/10|████████▎                        |  25/100 [     - it/sec]'
