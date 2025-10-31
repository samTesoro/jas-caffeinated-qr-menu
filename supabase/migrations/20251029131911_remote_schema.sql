

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE OR REPLACE FUNCTION "public"."update_cart_total"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    UPDATE cart 
    SET total_price = (
        SELECT COALESCE(SUM(subtotal_price), 0)
        FROM cartitem 
        WHERE cart_id = COALESCE(NEW.cart_id, OLD.cart_id)
    )
    WHERE cart_id = COALESCE(NEW.cart_id, OLD.cart_id);
    
    RETURN COALESCE(NEW, OLD);
END;
$$;


ALTER FUNCTION "public"."update_cart_total"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."adminusers" (
    "user_id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "username" "text" NOT NULL,
    "password" "text" NOT NULL,
    "view_orders" boolean DEFAULT false NOT NULL,
    "view_history" boolean DEFAULT false NOT NULL,
    "view_menu" boolean DEFAULT false NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "view_super" boolean DEFAULT false,
    "view_reviews" boolean DEFAULT false,
    "is_blocked" boolean DEFAULT false,
    "view_tables" boolean
);


ALTER TABLE "public"."adminusers" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."cart_cart_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."cart_cart_id_seq" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."cart" (
    "cart_id" integer DEFAULT "nextval"('"public"."cart_cart_id_seq"'::"regclass") NOT NULL,
    "time_created" timestamp without time zone DEFAULT "now"() NOT NULL,
    "total_price" double precision DEFAULT 0.0 NOT NULL,
    "checked_out" boolean DEFAULT false,
    "session_id" "text",
    "table_number" smallint
);


ALTER TABLE "public"."cart" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."cartitem_cartitem_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."cartitem_cartitem_id_seq" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."cartitem" (
    "cartitem_id" integer DEFAULT "nextval"('"public"."cartitem_cartitem_id_seq"'::"regclass") NOT NULL,
    "quantity" integer NOT NULL,
    "subtotal_price" double precision NOT NULL,
    "menuitem_id" integer,
    "cart_id" integer,
    "note" "text"
);


ALTER TABLE "public"."cartitem" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."customer_customer_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."customer_customer_id_seq" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."customer" (
    "customer_id" integer DEFAULT "nextval"('"public"."customer_customer_id_seq"'::"regclass") NOT NULL,
    "table_num" integer NOT NULL,
    "is_active" boolean DEFAULT true
);


ALTER TABLE "public"."customer" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."menuitem" (
    "menuitem_id" bigint NOT NULL,
    "name" "text" NOT NULL,
    "category" "text" NOT NULL,
    "price" real NOT NULL,
    "status" "text" NOT NULL,
    "thumbnail" "text",
    "description" "text",
    "is_favorites" boolean DEFAULT false,
    "est_time" smallint
);


ALTER TABLE "public"."menuitem" OWNER TO "postgres";


ALTER TABLE "public"."menuitem" ALTER COLUMN "menuitem_id" ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME "public"."menuitem_menuitem_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE SEQUENCE IF NOT EXISTS "public"."order_order_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."order_order_id_seq" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."order" (
    "order_id" integer DEFAULT "nextval"('"public"."order_order_id_seq"'::"regclass") NOT NULL,
    "date_ordered" "date" NOT NULL,
    "time_ordered" time without time zone NOT NULL,
    "payment_type" character varying NOT NULL,
    "isfinished" boolean DEFAULT false,
    "iscancelled" boolean DEFAULT false,
    "customer_id" integer,
    "cart_id" integer,
    "iscleared" boolean
);


ALTER TABLE "public"."order" OWNER TO "postgres";


COMMENT ON COLUMN "public"."order"."iscleared" IS 'clear history';



CREATE TABLE IF NOT EXISTS "public"."reviews" (
    "id" bigint NOT NULL,
    "rating" integer NOT NULL,
    "comment" "text",
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()),
    "table_id" "text",
    "session_id" "text",
    CONSTRAINT "reviews_rating_check" CHECK ((("rating" >= 1) AND ("rating" <= 5)))
);


ALTER TABLE "public"."reviews" OWNER TO "postgres";


ALTER TABLE "public"."reviews" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."reviews_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



ALTER TABLE ONLY "public"."adminusers"
    ADD CONSTRAINT "adminusers_pkey" PRIMARY KEY ("user_id");



ALTER TABLE ONLY "public"."adminusers"
    ADD CONSTRAINT "adminusers_username_key" UNIQUE ("username");



ALTER TABLE ONLY "public"."cart"
    ADD CONSTRAINT "cart_pkey" PRIMARY KEY ("cart_id");



ALTER TABLE ONLY "public"."cartitem"
    ADD CONSTRAINT "cartitem_pkey" PRIMARY KEY ("cartitem_id");



ALTER TABLE ONLY "public"."customer"
    ADD CONSTRAINT "customer_pkey" PRIMARY KEY ("customer_id");



ALTER TABLE ONLY "public"."menuitem"
    ADD CONSTRAINT "menuitem_pkey" PRIMARY KEY ("menuitem_id");



ALTER TABLE ONLY "public"."order"
    ADD CONSTRAINT "order_pkey" PRIMARY KEY ("order_id");



ALTER TABLE ONLY "public"."reviews"
    ADD CONSTRAINT "reviews_pkey" PRIMARY KEY ("id");



CREATE INDEX "idx_adminusers_is_blocked" ON "public"."adminusers" USING "btree" ("is_blocked");



CREATE INDEX "idx_adminusers_username" ON "public"."adminusers" USING "btree" ("username");



CREATE INDEX "idx_cart_checked_out" ON "public"."cart" USING "btree" ("checked_out");



CREATE INDEX "idx_cart_session_checked_out_created" ON "public"."cart" USING "btree" ("session_id", "checked_out", "time_created" DESC);



CREATE INDEX "idx_cart_session_id" ON "public"."cart" USING "btree" ("session_id");



CREATE INDEX "idx_cart_time_created" ON "public"."cart" USING "btree" ("time_created");



CREATE INDEX "idx_cartitem_cart_id" ON "public"."cartitem" USING "btree" ("cart_id");



CREATE INDEX "idx_cartitem_menuitem_id" ON "public"."cartitem" USING "btree" ("menuitem_id");



CREATE INDEX "idx_customer_active_table" ON "public"."customer" USING "btree" ("table_num") WHERE ("is_active" IS TRUE);



CREATE INDEX "idx_customer_is_active" ON "public"."customer" USING "btree" ("is_active");



CREATE INDEX "idx_customer_table_num" ON "public"."customer" USING "btree" ("table_num");



CREATE INDEX "idx_menuitem_category" ON "public"."menuitem" USING "btree" ("category");



CREATE INDEX "idx_menuitem_status" ON "public"."menuitem" USING "btree" ("status");



CREATE INDEX "idx_order_date_ordered" ON "public"."order" USING "btree" ("date_ordered");



CREATE INDEX "idx_order_iscancelled" ON "public"."order" USING "btree" ("iscancelled");



CREATE INDEX "idx_order_isfinished" ON "public"."order" USING "btree" ("isfinished");



CREATE UNIQUE INDEX "uniq_open_cart_per_session" ON "public"."cart" USING "btree" ("session_id") WHERE ("checked_out" IS FALSE);



ALTER TABLE ONLY "public"."cartitem"
    ADD CONSTRAINT "cartitem_cart_id_fkey" FOREIGN KEY ("cart_id") REFERENCES "public"."cart"("cart_id");



ALTER TABLE ONLY "public"."cartitem"
    ADD CONSTRAINT "cartitem_menuitem_id_fkey" FOREIGN KEY ("menuitem_id") REFERENCES "public"."menuitem"("menuitem_id");



ALTER TABLE ONLY "public"."order"
    ADD CONSTRAINT "order_cart_id_fkey" FOREIGN KEY ("cart_id") REFERENCES "public"."cart"("cart_id");



ALTER TABLE ONLY "public"."order"
    ADD CONSTRAINT "order_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "public"."customer"("customer_id");





ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";






GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";

























































































































































GRANT ALL ON FUNCTION "public"."update_cart_total"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_cart_total"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_cart_total"() TO "service_role";


















GRANT ALL ON TABLE "public"."adminusers" TO "anon";
GRANT ALL ON TABLE "public"."adminusers" TO "authenticated";
GRANT ALL ON TABLE "public"."adminusers" TO "service_role";



GRANT ALL ON SEQUENCE "public"."cart_cart_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."cart_cart_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."cart_cart_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."cart" TO "anon";
GRANT ALL ON TABLE "public"."cart" TO "authenticated";
GRANT ALL ON TABLE "public"."cart" TO "service_role";



GRANT ALL ON SEQUENCE "public"."cartitem_cartitem_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."cartitem_cartitem_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."cartitem_cartitem_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."cartitem" TO "anon";
GRANT ALL ON TABLE "public"."cartitem" TO "authenticated";
GRANT ALL ON TABLE "public"."cartitem" TO "service_role";



GRANT ALL ON SEQUENCE "public"."customer_customer_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."customer_customer_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."customer_customer_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."customer" TO "anon";
GRANT ALL ON TABLE "public"."customer" TO "authenticated";
GRANT ALL ON TABLE "public"."customer" TO "service_role";



GRANT ALL ON TABLE "public"."menuitem" TO "anon";
GRANT ALL ON TABLE "public"."menuitem" TO "authenticated";
GRANT ALL ON TABLE "public"."menuitem" TO "service_role";



GRANT ALL ON SEQUENCE "public"."menuitem_menuitem_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."menuitem_menuitem_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."menuitem_menuitem_id_seq" TO "service_role";



GRANT ALL ON SEQUENCE "public"."order_order_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."order_order_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."order_order_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."order" TO "anon";
GRANT ALL ON TABLE "public"."order" TO "authenticated";
GRANT ALL ON TABLE "public"."order" TO "service_role";



GRANT ALL ON TABLE "public"."reviews" TO "anon";
GRANT ALL ON TABLE "public"."reviews" TO "authenticated";
GRANT ALL ON TABLE "public"."reviews" TO "service_role";



GRANT ALL ON SEQUENCE "public"."reviews_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."reviews_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."reviews_id_seq" TO "service_role";









ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";






























drop extension if exists "pg_net";


  create policy "Allow all inserts"
  on "storage"."objects"
  as permissive
  for insert
  to public
with check (true);



  create policy "Allow all select"
  on "storage"."objects"
  as permissive
  for select
  to public
using (true);



