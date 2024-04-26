***VGraphs***

A little website you can use to animate data in csv tables.

**How to use:**

-put a csv or txt file in the input and specify duration and graph type of the animation you want.

valid table format:  

Diagram Name ;Column Name ; Column Name ; ...  
Row Name     ; Value       ; Value       ; ...  
Row Name     ; Value       ; Value       ; ...  
...  

Example (made up statistic)  

Inhabitants ; Doeton ; Johnville  
2018        ; 6500   ; 3450  
2019        ; 6700   ; 3550  
2020        ; 6400   ; 4950  
2021        ; 6200   ; 6500  

If you navigate to res/data in this repository, you will find some example statistics! (some are made up)  

Even though only the symbols , and ; are commonly used in csv to separate values,    
the symbols that can be used to separate values here are , | and ;  
So, do not include these in any value or name in your table except to separate values.  
So that the program does not  
find the wrong separating symbol and doesnt load correctly.

-Valdotorium
