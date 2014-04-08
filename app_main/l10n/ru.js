l10n = { lang: 'ru',//!!! локализация используется только в UI (для простоты обновления)
    app: 'СУПРО Демо'
    ,welcome: 'Вас приветствует СУПРО:  Заказы/Приходы/Продажи'
    ,reload: 'перезагрузить',

    loading: 'Загрузка...'
    ,errload: 'Загрузка прекращена из-за ошибок.'
    ,errload_no_app:
        'Ошибка установки! Не найден файл "app_front.js".\n' +
        'Нужно проверить конфигурацию и состав программы.'
    ,errload_config_read:
        'Ошибка при чтении файла конфигурации!'
    ,errload_config_log_not_dir:
        'Ошибка: нельзя прочитать директорию логов.\n' +
        'Опция в конфигурационном файле: '
    ,errload_config_log_mkdir: 'Ошибка: нельзя создать директорию логов.'
    ,errload_spawn_backend: 'Ошибка при запуске бэкэнда! Код ошибки: '
    ,errload_check_backend: '\n' +
'Ошибка! Основа системы запущена, но нет доступа по HTTP!\n' +
'Возможно файервол или антивирус блокирует работу портов TCP/IP.\n\n' +
'Необходимо вмешательство спецов: администратора или разработчика.'
    ,tray:{
        title: 'СУПРО'
        ,winvis: 'СУПРО окно видно'
        ,wininv: 'СУПРО окно скрыто'
    }

    ,extjsNotFound:
        'Не найден или не загрузился "ExtJS" (визуальная библиотека).\n' +
        'Нужно проверить конфигурацию программы.'
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
'Пустая конфигурация `config.extjs.path`.\n\n' +
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
    ,stsKilled: 'основной процесс "убит"'
    ,stsKilledAlready: 'основной процесс уже "умер"'
    ,stsAlive: 'основной процесс "живой"'
    ,stsDead: 'Запрос проигнорирован. Нужно перезапустить основной процесс'
    ,stsMsg: 'Сообщений: '
    ,stsMarkRead: 'Пометить все сообщения как прочитанные'

    ,time: 'Время'
    ,operation: 'Операция'
    ,description: 'Описание'
    ,result: 'Итог'

    ,shutdown: 'Выйти или блокировать'
    ,connection: 'Состояние сетевого соединения'
    ,userStatus: 'Рабочий статус пользователя'
    ,userStatusMenu: 'Статусы<br/>пользователя'
    ,userStatuses: { 'online': 'Здесь','away': 'Нет на месте','busy':'Не беспокоить','offline':'Нету (совсем)' }

// места для модулей
    ,um: null // user manager
}
