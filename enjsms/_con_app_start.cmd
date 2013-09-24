@echo off
set CYGWIN=nodosfilewarning
set JSAPPSTART=console
rem current working directory must be set up by shortcut or by manual running from here
..\nodenwer\bin\sh.exe -c "p=/etc/init.d; c='./app.conf start'; $p/mongodb+.sh $c && $p/node+.sh $c"
start http://localhost:3002

echo .
echo ВНИМАНИЕ! Окно консоли НЕ закрывать!!!
echo .

