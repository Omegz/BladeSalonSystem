CREATE TABLE "appointments" (
	"id" serial PRIMARY KEY NOT NULL,
	"service" text NOT NULL,
	"start_time" timestamp NOT NULL,
	"end_time" timestamp NOT NULL,
	"email" text NOT NULL,
	"phone" text NOT NULL,
	"name" text
);
