Known problems
============

> Progress bar not working for Windows 7

Windows 7 cannot fully handle ANSI control sequences. The bar is not shown but VergeML should still be working.

> Out of memory error

This error occurs if your GPU runs out of memory. You can try decreasing batch size during training or lowering the size of your model structure (decreasing layer count). 
