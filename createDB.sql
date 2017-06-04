SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SET check_function_bodies = false;
SET client_min_messages = warning;
SET row_security = off;


CREATE DATABASE cnstbmb_db WITH TEMPLATE = template0 ENCODING = 'UTF8' LC_COLLATE = 'ru_RU.UTF-8' LC_CTYPE = 'ru_RU.UTF-8';


\connect cnstbmb_db

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SET check_function_bodies = false;
SET client_min_messages = warning;
SET row_security = off;

CREATE EXTENSION IF NOT EXISTS plpgsql WITH SCHEMA pg_catalog;

COMMENT ON EXTENSION plpgsql IS 'PL/pgSQL procedural language';


SET search_path = public, pg_catalog;

SET default_tablespace = '';

SET default_with_oids = false;

CREATE TABLE error_events (
    event_id bigint NOT NULL,
    event_date timestamp without time zone DEFAULT now(),
    event_log text,
    event_reason text
);


CREATE SEQUENCE error_events_event_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE error_events_event_id_seq OWNED BY error_events.event_id;

CREATE TABLE event_counter (
    producer_name text,
    message_time timestamp without time zone DEFAULT now()
);

CREATE TABLE messages (
    producer_time bigint,
    consumer_time bigint,
    message text
);

CREATE TABLE sys_error (
    error_text text,
    error_time timestamp without time zone DEFAULT now()
);

ALTER TABLE ONLY error_events ALTER COLUMN event_id SET DEFAULT nextval('error_events_event_id_seq'::regclass);

SELECT pg_catalog.setval('error_events_event_id_seq', 39, true);
