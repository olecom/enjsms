@echo off
set CYGWIN=nodosfilewarning
set JSAPPSTART=console
rem current working directory must be set up by shortcut or by manual running from here
rem c: cd \enjsms
..\nodenwer\bin\sh.exe -c "p=/etc/init.d; c='./app.conf start'; $p/mongodb+.sh $c"
..\nodenwer\bin\sh.exe /etc/init.d/node+.sh ./app.conf devstart
pause
exit
