1) Для запуска на своём ПК, необходимо провести миграцию. Для этого в консоли выполнить команду - 
sudo db-migrate up cnstbmb-db --config '%path_project%/configs/db_config.json' --verbose true
2) Для запуска продюсера, необходимо запустить runProducer.js , передать аргументом порт,
на котором будет запущен продюсер (node runProducer 3001). порт 3000 зарезервирован express'ом.
3) Для запуска потербителя, необходимо запустить runConsumer.js (node runConsumer)
4) Для запуска express - DEBUG=myapp:* npm start (localhost:3000)