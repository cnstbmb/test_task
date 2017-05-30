1) Для запуска на своём ПК, необходимо создать БД. В командной строке, на сервере, запустить - 
 psql -U user -h localhost -f dumpDB.sql
2) Для запуска продюсера, необходимо запустить /rabbitApp/producer.js , передать аргументом порт,
на котором будет запущен продюсер (node producer 3001). порт 3000 зарезервирован express'ом.
3) Для запуска потербителя, необходимо запустить /rabbitApp/consumer.js (node consumer)
4) Для запуска express - DEBUG=myapp:* npm start (localhost:3000)