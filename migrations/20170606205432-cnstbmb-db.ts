'use strict';

let dbm;
let type;
let seed;

/**
  * We receive the dbmigrate dependency from dbmigrate initially.
  * This enables us to not have to rely on NODE_PATH.
  */
exports.setup = (options:any, seedLink:any) => {
  dbm = options.dbmigrate;
  type = dbm.dataType;
  seed = seedLink;
};

exports.up = (db:any) => {
    return db.createTable('error_events', {
        event_id: {type: 'bigserial'},
        event_date: {type: 'bigint'},
        event_log: {type: 'text'},
        event_reason: {type: 'text'}
    }).then(
        ()=>{
            db.createTable('event_counter', {
                producer_name: { type: 'text' },
                message_time: { type: 'bigint'},
            });
        }
    ).then(
        () => {
            db.createTable('messages', {
                producer_time: { type: 'bigint' },
                consumer_time: { type: 'bigint' },
                message: { type: 'text' },
            });
        }
    ).then(
        () => {
            db.createTable('sys_error', {
                error_text: { type: 'text' },
                error_time: { type: 'bigint'},
            });
        },(err:any) => {
            console.log(err);
            return err;
        }
    );
};

exports.down = (db:any) => {
    return db.dropTable('error_events')
        .then(() => {
            db.dropTable('event_counter');
        }).then(() => {
            db.dropTable('messages');
        }).then(() => {
            db.dropTable('sys_error');
        }, (err:any) => {
            console.log(err);
            return err;
    });
};

exports._meta = {
    "version": 1
};
