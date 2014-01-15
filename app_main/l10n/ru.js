var l10n = {
    loading: 'Загрузка...'
    ,errload: 'Загрузка прекращена из-за ошибок.'
    ,errload_no_app:
        'Ошибка установки! Не найден файл "app_front.js".\n' +
        'Нужно проверить конфигурацию и состав программы "enjsms".'
    ,errload_config_read:
        'Ошибка при чтении файла конфигурации!'
    ,errload_config_log_not_dir:
        'Ошибка: нельзя прочитать директорию логов.\n' +
        'Опция в конфигурационном файле: '
    ,errload_config_log_mkdir: 'Ошибка: нельзя создать директорию логов.'
    ,errload_spawn_backend: 'Ошибка при запуске бэкэнда! Код ошибки: '
    ,tray: {
        title: 'SMSки'
        ,winvis: 'SMSки работают (окно видно)'
        ,wininv: 'SMSки работают (окно скрыто)'
    }
    ,extjsNotFound:
        'Не найден или не загрузился "ExtJS" (визуальная библиотека).\n' +
        'Нужно проверить конфигурацию программы "enjsms".'
    ,extjsPathNotFound: function(быстрый_файл_конфига, конфиг, ж){
        var пример_названия = '\n\n'+
'Пример названия директории релиза ExtJS 4.2.1: "ext-4.2.1.883".'
           ,о_файле = ''+
'Файл `' + быстрый_файл_конфига + '` в корне программы, ' +
'отсуствует или содержит название директории, которой нет.' +
пример_названия

        if(1 == ж){
            return ''+
'Конфигурация `config.extjs.path` = "' + конфиг +
'" не указывает место расположения ExtJS.\n\n' +
о_файле
        }
        if(2 == ж){
            return ''+
'Пустрая конфигурация `config.extjs.path`.\n\n' +
о_файле
        }
        return '' +
'Ни локальный файл `' + быстрый_файл_конфига +
'`,\nни конфигурация `config.extjs.path` = "' + конфиг +
'"\nне указывают место расположения ExtJS.' +
пример_названия
    }
    ,uncaughtException: 'Неожиданная внутренняя ошибка! Обратитесь к разработчикам.\n'

    ,stsSystem: 'Связь с основным процессом. Информация (Log).'
    ,stsHandleTipTitle: 'Что и как происходит внутри системы?'
    ,stsHandleTip: 'Двойной клик по шестерням раскрывает или скрывает содержимое'
    ,stsStart: 'ЗАПУСК основной `nodejs`'
    ,stsCheck: 'ПРОВЕРКА работы основной `nodejs`'
    ,stsRestarting: '(2 сек.) запускается новый основной `nodejs`'
    ,stsKilling: 'ЗАВЕРШИТЬ основной `nodejs` (завис)'
    ,stsBackendPid: function(pid){
        return '' + pid + ' - идентификатор основного процесса(nodejs) системы'
    }
    ,stsBackendXHR: "подключение к основному процессу(nodejs) системы"
    ,stsOK: 'OK'
    ,stsHE: 'НЕ'
    ,stsClean: 'Очистить'
    ,stsEcho: 'Запрос-проверка'
    ,stsRestart: 'Перезапустить'
    ,stsKill: 'Завершить силой, "убить" (завис)'
    ,stsKilled: 'основной процесс "умер"'
    ,stsAlive: 'основной процесс "живой"'

    ,time: 'Время'
    ,operation: 'Операция'
    ,description: 'Описание'
    ,result: 'Итог'

    ,shutdown: 'Выйти или блокировать'
    ,connection: 'Состояние сетевого соединения'
    ,userStatus: 'Рабочий статус пользователя'
    ,userStatusMenu: 'Статусы<br/>пользователя'
    ,userStatuses: { 'online': 'Здесь','away': 'Нет на месте','busy':'Не беспокоить','offline':'Нету (совсем)' }
    ,um:{// users manager
        users: 'Пользователи'
    }
}
