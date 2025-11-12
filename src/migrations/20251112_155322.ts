import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-vercel-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_discussion_posts_status" AS ENUM('draft', 'published', 'archived');
  CREATE TYPE "public"."enum_events_date_time_zone" AS ENUM('CDT', 'CST', 'EDT', 'EST', 'PDT', 'PST');
  CREATE TYPE "public"."enum_users_roles" AS ENUM('admin', 'user');
  CREATE TYPE "public"."enum_users_login_method" AS ENUM('google', 'email');
  CREATE TYPE "public"."enum_comments_status" AS ENUM('pending', 'approved', 'rejected');
  CREATE TYPE "public"."enum_gift_shop_transactions_status" AS ENUM('pending', 'processing', 'shipped', 'delivered', 'cancelled');
  CREATE TYPE "public"."enum_guide_additional_info_icon" AS ENUM('navattic', 'activity', 'album', 'align-center', 'align-horizontal-space-around', 'align-left', 'align-right', 'align-vertical-space-around', 'aperture', 'app-window', 'archive', 'arrow-big-left', 'arrow-big-right', 'arrow-down-1-0', 'arrow-down-from-line', 'arrow-down-left', 'arrow-down-narrow-wide', 'arrow-down-right', 'arrow-down-wide-narrow', 'arrow-down', 'arrow-left-right', 'arrow-left', 'arrow-right-left', 'arrow-right', 'arrow-up-0-1', 'arrow-up-down', 'arrow-up-from-line', 'arrow-up-left', 'arrow-up-narrow-wide', 'arrow-up-right', 'arrow-up-wide-narrow', 'arrow-up', 'asterisk', 'at-sign', 'audio-lines', 'award', 'badge-check', 'ban', 'bar-chart-2', 'bar-chart', 'baseline', 'bell-dot', 'between-horizontal-start', 'biceps-flexed', 'binary', 'blend', 'blocks', 'bold', 'book-a', 'book-dashed', 'book-marked', 'book-open-check', 'book-open-text', 'book-open', 'book-text', 'book-user', 'book-x', 'book', 'bookmark-x', 'bookmark', 'box', 'boxes', 'brick-wall', 'building-2', 'building', 'calendar-check', 'calendar-clock', 'calendar-days', 'calendar-sync', 'calendar', 'camera', 'case-sensitive', 'case-upper', 'chart-column-decreasing', 'chart-column', 'chart-line', 'chart-no-axes-column-increasing', 'chart-no-axes-column', 'chart-no-axes-combined', 'chart-spline', 'check-circle-2', 'check', 'chevron-down', 'chevron-left', 'chevron-right', 'chevron-up', 'chevrons-left-right', 'chevrons-up-down', 'chrome', 'circle-alert', 'circle-arrow-out-up-right', 'circle-arrow-up', 'circle-check-big', 'circle-check', 'circle-dashed', 'circle-dollar-sign', 'circle-fading-arrow-up', 'circle-fading-plus', 'circle-help', 'circle-play', 'circle-plus', 'circle-user-round', 'circle-user', 'circle-x', 'circle', 'clipboard-signature', 'clipboard-type', 'clipboard', 'clock', 'cloudy', 'code', 'coins', 'columns-2', 'command', 'component', 'contact', 'cookie', 'copy', 'corner-down-left', 'corner-down-right', 'corner-up-right', 'crop', 'database-backup', 'diff', 'disc', 'dollar-sign', 'download', 'droplet', 'ellipsis', 'equal', 'expand', 'external-link', 'eye-off', 'eye', 'facebook', 'file-json-2', 'file-plus', 'file-text', 'file-up', 'file-video-2', 'file', 'filter', 'fingerprint', 'flag-triangle-right', 'flag', 'flip-horizontal', 'folder-plus', 'folder', 'form-input', 'fullscreen', 'gallery-vertical-end', 'gallery-vertical', 'gantt-chart', 'gift', 'git-merge', 'globe-lock', 'globe', 'graduation-cap', 'grid-2x2-plus', 'grid3x3', 'grip-vertical', 'hammer', 'hand-coins', 'hard-drive', 'hash', 'heading-1', 'heading-2', 'heading-3', 'heading-4', 'heading-5', 'heading-6', 'help-circle', 'home', 'hotel', 'house', 'id-card', 'image-play', 'image-plus', 'image', 'inbox', 'infinity', 'info', 'italic', 'key-round', 'key', 'keyboard', 'lamp-desk', 'landmark', 'languages', 'laptop', 'layers-2', 'layers', 'layout-dashboard', 'layout-grid', 'layout-panel-left', 'library-big', 'life-buoy', 'lightbulb', 'link-2-off', 'link-2', 'link', 'linkedin', 'list-checks', 'list-end', 'list-filter', 'list-ordered', 'list-restart', 'list-start', 'list-todo', 'list', 'loader', 'locate', 'lock-keyhole-open', 'lock-keyhole', 'lock', 'log-out', 'logs', 'mail', 'map-pin', 'maximize-2', 'maximize', 'medal', 'megaphone', 'menu', 'merge', 'message-circle-reply', 'message-circle', 'message-square-dashed', 'message-square-dot', 'message-square-text', 'message-square', 'messages-square', 'mic', 'minimize-2', 'minimize', 'minus-circle', 'minus', 'monitor', 'moon', 'more-horizontal', 'more-vertical', 'mouse-pointer-click', 'mouse-pointer-square-dashed', 'mouse-pointer-square', 'mouse-pointer', 'move', 'not-equal', 'palette', 'panel-left-open', 'panel-left', 'panel-right-open', 'panel-right', 'panel-top', 'panels-top-left', 'pause', 'pen-line', 'pen', 'pencil-line', 'pencil-ruler', 'pencil', 'phone', 'picture-in-picture-2', 'pin-off', 'pin', 'plane', 'play', 'plug-zap', 'plus-circle', 'plus', 'podcast', 'pointer', 'presentation', 'radio', 'redo-2', 'redo-dot', 'refresh', 'repeat-2', 'repeat', 'replace', 'reply', 'rocket', 'rotate-ccw', 'route', 'ruler-dimension-line', 'salad', 'save', 'scaling', 'scan-heart', 'search-check', 'search', 'send', 'settings', 'shapes', 'share-2', 'share', 'sheet', 'shield-check', 'shield-half', 'shield', 'ship', 'shuffle', 'slack', 'sliders-horizontal', 'sliders-vertical', 'sliders', 'smartphone', 'smile', 'sparkle', 'sparkles', 'speech', 'spinner', 'split', 'square-asterisk', 'square-check-big', 'square-check', 'square-mouse-pointer', 'square-pen', 'square-round-corner', 'square-split-horizontal', 'square-x', 'square', 'star-filled', 'star', 'sticky-note', 'store', 'strikethrough', 'sun', 'swatch-book', 'table-2', 'table', 'tablet-smartphone', 'tag', 'target', 'text-cursor-input', 'text-cursor', 'text-quote', 'thumbs-up-filled', 'thumbs-up', 'ticket', 'timer', 'toggle-right', 'trash-2', 'trash', 'tree-palm', 'trending-up', 'triangle-alert', 'trophy', 'type', 'underline', 'undo-2', 'undo-dot', 'unfold-horizontal', 'unfold-vertical', 'unlock', 'unpin', 'upload', 'user-check', 'user-cog', 'user-pen', 'user-plus', 'user-round-check', 'user-round-pen', 'user-round-plus', 'user-round', 'user-search', 'user-x', 'user', 'users-round', 'users', 'video', 'volume-2', 'volume-off', 'volume-x', 'wand-sparkles', 'warehouse', 'webcam', 'webhook', 'wifi-off', 'wifi', 'wrench', 'x-circle', 'x', 'youtube', 'zap');
  CREATE TABLE IF NOT EXISTS "challenges" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"description" varchar NOT NULL,
  	"deadline" timestamp(3) with time zone NOT NULL,
  	"points" numeric NOT NULL,
  	"content" jsonb NOT NULL,
  	"slug" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE IF NOT EXISTS "challenges_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"ledger_id" integer
  );
  
  CREATE TABLE IF NOT EXISTS "discussion_posts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"content" jsonb NOT NULL,
  	"author_id" integer NOT NULL,
  	"slug" varchar,
  	"status" "enum_discussion_posts_status" DEFAULT 'published',
  	"last_activity" timestamp(3) with time zone,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE IF NOT EXISTS "ledger" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"user_id_id" integer NOT NULL,
  	"amount" numeric NOT NULL,
  	"reason" varchar NOT NULL,
  	"challenge_id_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE IF NOT EXISTS "events" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"event_page_url" varchar NOT NULL,
  	"cta_label" varchar,
  	"cta_link" varchar,
  	"image_id" integer NOT NULL,
  	"location_is_webinar" boolean DEFAULT false,
  	"location_name" varchar NOT NULL,
  	"location_link" varchar,
  	"location_address" varchar,
  	"date_display_date" varchar NOT NULL,
  	"date_start_time_date" timestamp(3) with time zone NOT NULL,
  	"date_start_time_time" varchar NOT NULL,
  	"date_end_time_date" timestamp(3) with time zone NOT NULL,
  	"date_end_time_time" varchar NOT NULL,
  	"date_time_zone" "enum_events_date_time_zone" DEFAULT 'CDT' NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE IF NOT EXISTS "users_roles" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum_users_roles",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE IF NOT EXISTS "users" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"first_name" varchar,
  	"last_name" varchar,
  	"title" varchar,
  	"location" varchar,
  	"linkedin_url" varchar,
  	"interactive_demo_url" varchar,
  	"bio" varchar,
  	"company_id" integer,
  	"avatar_id" integer,
  	"login_method" "enum_users_login_method" DEFAULT 'email' NOT NULL,
  	"slug" varchar,
  	"user_id" varchar,
  	"onboarding_completed" boolean DEFAULT false,
  	"timezone" varchar DEFAULT 'UTC' NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"email" varchar NOT NULL,
  	"reset_password_token" varchar,
  	"reset_password_expiration" timestamp(3) with time zone,
  	"salt" varchar,
  	"hash" varchar,
  	"login_attempts" numeric DEFAULT 0,
  	"lock_until" timestamp(3) with time zone
  );
  
  CREATE TABLE IF NOT EXISTS "comments" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"content" varchar NOT NULL,
  	"user_id" integer NOT NULL,
  	"challenge_id" integer,
  	"discussion_post_id" integer,
  	"parent_id" integer,
  	"status" "enum_comments_status" DEFAULT 'approved',
  	"deleted" boolean DEFAULT false,
  	"likes" numeric DEFAULT 0,
  	"flagged_reports" numeric DEFAULT 0,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE IF NOT EXISTS "comments_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"users_id" integer
  );
  
  CREATE TABLE IF NOT EXISTS "media" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"alt" varchar NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"url" varchar,
  	"thumbnail_u_r_l" varchar,
  	"filename" varchar,
  	"mime_type" varchar,
  	"filesize" numeric,
  	"width" numeric,
  	"height" numeric,
  	"focal_x" numeric,
  	"focal_y" numeric
  );
  
  CREATE TABLE IF NOT EXISTS "avatars" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"alt" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"url" varchar,
  	"thumbnail_u_r_l" varchar,
  	"filename" varchar,
  	"mime_type" varchar,
  	"filesize" numeric,
  	"width" numeric,
  	"height" numeric,
  	"focal_x" numeric,
  	"focal_y" numeric,
  	"sizes_thumbnail_url" varchar,
  	"sizes_thumbnail_width" numeric,
  	"sizes_thumbnail_height" numeric,
  	"sizes_thumbnail_mime_type" varchar,
  	"sizes_thumbnail_filesize" numeric,
  	"sizes_thumbnail_filename" varchar,
  	"sizes_profile_url" varchar,
  	"sizes_profile_width" numeric,
  	"sizes_profile_height" numeric,
  	"sizes_profile_mime_type" varchar,
  	"sizes_profile_filesize" numeric,
  	"sizes_profile_filename" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "companies" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"website" varchar,
  	"author_id" integer,
  	"logo_src_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE IF NOT EXISTS "company_logos" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"alt" varchar,
  	"default_url" varchar,
  	"uploaded_logo_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE IF NOT EXISTS "products" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"description" varchar NOT NULL,
  	"short_description" varchar NOT NULL,
  	"price" numeric NOT NULL,
  	"image_id" integer NOT NULL,
  	"is_active" boolean DEFAULT true,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE IF NOT EXISTS "products_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"users_id" integer
  );
  
  CREATE TABLE IF NOT EXISTS "gift_shop_transactions" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"user_id" integer NOT NULL,
  	"product_id" integer NOT NULL,
  	"ledger_entry_id" integer NOT NULL,
  	"status" "enum_gift_shop_transactions_status" DEFAULT 'pending' NOT NULL,
  	"shipping_address_name" varchar,
  	"shipping_address_address" varchar,
  	"shipping_address_city" varchar,
  	"shipping_address_state" varchar,
  	"shipping_address_zip_code" varchar,
  	"shipping_address_country" varchar,
  	"tracking_info_carrier" varchar,
  	"tracking_info_tracking_number" varchar,
  	"tracking_info_estimated_delivery" timestamp(3) with time zone,
  	"admin_notes" varchar,
  	"user_notes" varchar,
  	"fulfillment_date" timestamp(3) with time zone,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE IF NOT EXISTS "verification_tokens" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"identifier" varchar NOT NULL,
  	"token" varchar NOT NULL,
  	"expires" timestamp(3) with time zone NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE IF NOT EXISTS "payload_locked_documents" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"global_slug" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE IF NOT EXISTS "payload_locked_documents_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"challenges_id" integer,
  	"discussion_posts_id" integer,
  	"ledger_id" integer,
  	"events_id" integer,
  	"users_id" integer,
  	"comments_id" integer,
  	"media_id" integer,
  	"avatars_id" integer,
  	"companies_id" integer,
  	"company_logos_id" integer,
  	"products_id" integer,
  	"gift_shop_transactions_id" integer,
  	"verification_tokens_id" integer
  );
  
  CREATE TABLE IF NOT EXISTS "payload_preferences" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar,
  	"value" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE IF NOT EXISTS "payload_preferences_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"users_id" integer
  );
  
  CREATE TABLE IF NOT EXISTS "payload_migrations" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"batch" numeric,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE IF NOT EXISTS "guide_additional_info" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"icon" "enum_guide_additional_info_icon" DEFAULT 'info' NOT NULL,
  	"title" varchar NOT NULL,
  	"description" varchar NOT NULL,
  	"content" jsonb NOT NULL
  );
  
  CREATE TABLE IF NOT EXISTS "guide" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"introduction" jsonb NOT NULL,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  DO $$ BEGIN
   ALTER TABLE "challenges_rels" ADD CONSTRAINT "challenges_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."challenges"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "challenges_rels" ADD CONSTRAINT "challenges_rels_ledger_fk" FOREIGN KEY ("ledger_id") REFERENCES "public"."ledger"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "discussion_posts" ADD CONSTRAINT "discussion_posts_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "ledger" ADD CONSTRAINT "ledger_user_id_id_users_id_fk" FOREIGN KEY ("user_id_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "ledger" ADD CONSTRAINT "ledger_challenge_id_id_challenges_id_fk" FOREIGN KEY ("challenge_id_id") REFERENCES "public"."challenges"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "events" ADD CONSTRAINT "events_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "users_roles" ADD CONSTRAINT "users_roles_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "users" ADD CONSTRAINT "users_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "users" ADD CONSTRAINT "users_avatar_id_avatars_id_fk" FOREIGN KEY ("avatar_id") REFERENCES "public"."avatars"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "comments" ADD CONSTRAINT "comments_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "comments" ADD CONSTRAINT "comments_challenge_id_challenges_id_fk" FOREIGN KEY ("challenge_id") REFERENCES "public"."challenges"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "comments" ADD CONSTRAINT "comments_discussion_post_id_discussion_posts_id_fk" FOREIGN KEY ("discussion_post_id") REFERENCES "public"."discussion_posts"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "comments" ADD CONSTRAINT "comments_parent_id_comments_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."comments"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "comments_rels" ADD CONSTRAINT "comments_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."comments"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "comments_rels" ADD CONSTRAINT "comments_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "companies" ADD CONSTRAINT "companies_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "companies" ADD CONSTRAINT "companies_logo_src_id_company_logos_id_fk" FOREIGN KEY ("logo_src_id") REFERENCES "public"."company_logos"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "company_logos" ADD CONSTRAINT "company_logos_uploaded_logo_id_media_id_fk" FOREIGN KEY ("uploaded_logo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "products" ADD CONSTRAINT "products_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "products_rels" ADD CONSTRAINT "products_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "products_rels" ADD CONSTRAINT "products_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "gift_shop_transactions" ADD CONSTRAINT "gift_shop_transactions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "gift_shop_transactions" ADD CONSTRAINT "gift_shop_transactions_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "gift_shop_transactions" ADD CONSTRAINT "gift_shop_transactions_ledger_entry_id_ledger_id_fk" FOREIGN KEY ("ledger_entry_id") REFERENCES "public"."ledger"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_locked_documents"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_challenges_fk" FOREIGN KEY ("challenges_id") REFERENCES "public"."challenges"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_discussion_posts_fk" FOREIGN KEY ("discussion_posts_id") REFERENCES "public"."discussion_posts"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_ledger_fk" FOREIGN KEY ("ledger_id") REFERENCES "public"."ledger"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_events_fk" FOREIGN KEY ("events_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_comments_fk" FOREIGN KEY ("comments_id") REFERENCES "public"."comments"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_avatars_fk" FOREIGN KEY ("avatars_id") REFERENCES "public"."avatars"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_companies_fk" FOREIGN KEY ("companies_id") REFERENCES "public"."companies"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_company_logos_fk" FOREIGN KEY ("company_logos_id") REFERENCES "public"."company_logos"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_products_fk" FOREIGN KEY ("products_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_gift_shop_transactions_fk" FOREIGN KEY ("gift_shop_transactions_id") REFERENCES "public"."gift_shop_transactions"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_verification_tokens_fk" FOREIGN KEY ("verification_tokens_id") REFERENCES "public"."verification_tokens"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_preferences"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "guide_additional_info" ADD CONSTRAINT "guide_additional_info_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."guide"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  CREATE INDEX IF NOT EXISTS "challenges_updated_at_idx" ON "challenges" USING btree ("updated_at");
  CREATE INDEX IF NOT EXISTS "challenges_created_at_idx" ON "challenges" USING btree ("created_at");
  CREATE INDEX IF NOT EXISTS "challenges_rels_order_idx" ON "challenges_rels" USING btree ("order");
  CREATE INDEX IF NOT EXISTS "challenges_rels_parent_idx" ON "challenges_rels" USING btree ("parent_id");
  CREATE INDEX IF NOT EXISTS "challenges_rels_path_idx" ON "challenges_rels" USING btree ("path");
  CREATE INDEX IF NOT EXISTS "challenges_rels_ledger_id_idx" ON "challenges_rels" USING btree ("ledger_id");
  CREATE INDEX IF NOT EXISTS "discussion_posts_author_idx" ON "discussion_posts" USING btree ("author_id");
  CREATE INDEX IF NOT EXISTS "discussion_posts_updated_at_idx" ON "discussion_posts" USING btree ("updated_at");
  CREATE INDEX IF NOT EXISTS "discussion_posts_created_at_idx" ON "discussion_posts" USING btree ("created_at");
  CREATE INDEX IF NOT EXISTS "ledger_user_id_idx" ON "ledger" USING btree ("user_id_id");
  CREATE INDEX IF NOT EXISTS "ledger_challenge_id_idx" ON "ledger" USING btree ("challenge_id_id");
  CREATE INDEX IF NOT EXISTS "ledger_updated_at_idx" ON "ledger" USING btree ("updated_at");
  CREATE INDEX IF NOT EXISTS "ledger_created_at_idx" ON "ledger" USING btree ("created_at");
  CREATE INDEX IF NOT EXISTS "events_image_idx" ON "events" USING btree ("image_id");
  CREATE INDEX IF NOT EXISTS "events_updated_at_idx" ON "events" USING btree ("updated_at");
  CREATE INDEX IF NOT EXISTS "events_created_at_idx" ON "events" USING btree ("created_at");
  CREATE INDEX IF NOT EXISTS "users_roles_order_idx" ON "users_roles" USING btree ("order");
  CREATE INDEX IF NOT EXISTS "users_roles_parent_idx" ON "users_roles" USING btree ("parent_id");
  CREATE INDEX IF NOT EXISTS "users_company_idx" ON "users" USING btree ("company_id");
  CREATE INDEX IF NOT EXISTS "users_avatar_idx" ON "users" USING btree ("avatar_id");
  CREATE INDEX IF NOT EXISTS "users_updated_at_idx" ON "users" USING btree ("updated_at");
  CREATE INDEX IF NOT EXISTS "users_created_at_idx" ON "users" USING btree ("created_at");
  CREATE UNIQUE INDEX IF NOT EXISTS "users_email_idx" ON "users" USING btree ("email");
  CREATE INDEX IF NOT EXISTS "comments_user_idx" ON "comments" USING btree ("user_id");
  CREATE INDEX IF NOT EXISTS "comments_challenge_idx" ON "comments" USING btree ("challenge_id");
  CREATE INDEX IF NOT EXISTS "comments_discussion_post_idx" ON "comments" USING btree ("discussion_post_id");
  CREATE INDEX IF NOT EXISTS "comments_parent_idx" ON "comments" USING btree ("parent_id");
  CREATE INDEX IF NOT EXISTS "comments_updated_at_idx" ON "comments" USING btree ("updated_at");
  CREATE INDEX IF NOT EXISTS "comments_created_at_idx" ON "comments" USING btree ("created_at");
  CREATE INDEX IF NOT EXISTS "comments_rels_order_idx" ON "comments_rels" USING btree ("order");
  CREATE INDEX IF NOT EXISTS "comments_rels_parent_idx" ON "comments_rels" USING btree ("parent_id");
  CREATE INDEX IF NOT EXISTS "comments_rels_path_idx" ON "comments_rels" USING btree ("path");
  CREATE INDEX IF NOT EXISTS "comments_rels_users_id_idx" ON "comments_rels" USING btree ("users_id");
  CREATE INDEX IF NOT EXISTS "media_updated_at_idx" ON "media" USING btree ("updated_at");
  CREATE INDEX IF NOT EXISTS "media_created_at_idx" ON "media" USING btree ("created_at");
  CREATE UNIQUE INDEX IF NOT EXISTS "media_filename_idx" ON "media" USING btree ("filename");
  CREATE INDEX IF NOT EXISTS "avatars_updated_at_idx" ON "avatars" USING btree ("updated_at");
  CREATE INDEX IF NOT EXISTS "avatars_created_at_idx" ON "avatars" USING btree ("created_at");
  CREATE UNIQUE INDEX IF NOT EXISTS "avatars_filename_idx" ON "avatars" USING btree ("filename");
  CREATE INDEX IF NOT EXISTS "avatars_sizes_thumbnail_sizes_thumbnail_filename_idx" ON "avatars" USING btree ("sizes_thumbnail_filename");
  CREATE INDEX IF NOT EXISTS "avatars_sizes_profile_sizes_profile_filename_idx" ON "avatars" USING btree ("sizes_profile_filename");
  CREATE INDEX IF NOT EXISTS "companies_author_idx" ON "companies" USING btree ("author_id");
  CREATE INDEX IF NOT EXISTS "companies_logo_src_idx" ON "companies" USING btree ("logo_src_id");
  CREATE INDEX IF NOT EXISTS "companies_updated_at_idx" ON "companies" USING btree ("updated_at");
  CREATE INDEX IF NOT EXISTS "companies_created_at_idx" ON "companies" USING btree ("created_at");
  CREATE INDEX IF NOT EXISTS "company_logos_uploaded_logo_idx" ON "company_logos" USING btree ("uploaded_logo_id");
  CREATE INDEX IF NOT EXISTS "company_logos_updated_at_idx" ON "company_logos" USING btree ("updated_at");
  CREATE INDEX IF NOT EXISTS "company_logos_created_at_idx" ON "company_logos" USING btree ("created_at");
  CREATE INDEX IF NOT EXISTS "products_image_idx" ON "products" USING btree ("image_id");
  CREATE INDEX IF NOT EXISTS "products_updated_at_idx" ON "products" USING btree ("updated_at");
  CREATE INDEX IF NOT EXISTS "products_created_at_idx" ON "products" USING btree ("created_at");
  CREATE INDEX IF NOT EXISTS "products_rels_order_idx" ON "products_rels" USING btree ("order");
  CREATE INDEX IF NOT EXISTS "products_rels_parent_idx" ON "products_rels" USING btree ("parent_id");
  CREATE INDEX IF NOT EXISTS "products_rels_path_idx" ON "products_rels" USING btree ("path");
  CREATE INDEX IF NOT EXISTS "products_rels_users_id_idx" ON "products_rels" USING btree ("users_id");
  CREATE INDEX IF NOT EXISTS "gift_shop_transactions_user_idx" ON "gift_shop_transactions" USING btree ("user_id");
  CREATE INDEX IF NOT EXISTS "gift_shop_transactions_product_idx" ON "gift_shop_transactions" USING btree ("product_id");
  CREATE INDEX IF NOT EXISTS "gift_shop_transactions_ledger_entry_idx" ON "gift_shop_transactions" USING btree ("ledger_entry_id");
  CREATE INDEX IF NOT EXISTS "gift_shop_transactions_updated_at_idx" ON "gift_shop_transactions" USING btree ("updated_at");
  CREATE INDEX IF NOT EXISTS "gift_shop_transactions_created_at_idx" ON "gift_shop_transactions" USING btree ("created_at");
  CREATE INDEX IF NOT EXISTS "verification_tokens_identifier_idx" ON "verification_tokens" USING btree ("identifier");
  CREATE INDEX IF NOT EXISTS "verification_tokens_token_idx" ON "verification_tokens" USING btree ("token");
  CREATE INDEX IF NOT EXISTS "verification_tokens_expires_idx" ON "verification_tokens" USING btree ("expires");
  CREATE INDEX IF NOT EXISTS "verification_tokens_updated_at_idx" ON "verification_tokens" USING btree ("updated_at");
  CREATE INDEX IF NOT EXISTS "verification_tokens_created_at_idx" ON "verification_tokens" USING btree ("created_at");
  CREATE INDEX IF NOT EXISTS "payload_locked_documents_global_slug_idx" ON "payload_locked_documents" USING btree ("global_slug");
  CREATE INDEX IF NOT EXISTS "payload_locked_documents_updated_at_idx" ON "payload_locked_documents" USING btree ("updated_at");
  CREATE INDEX IF NOT EXISTS "payload_locked_documents_created_at_idx" ON "payload_locked_documents" USING btree ("created_at");
  CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_order_idx" ON "payload_locked_documents_rels" USING btree ("order");
  CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_parent_idx" ON "payload_locked_documents_rels" USING btree ("parent_id");
  CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_path_idx" ON "payload_locked_documents_rels" USING btree ("path");
  CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_challenges_id_idx" ON "payload_locked_documents_rels" USING btree ("challenges_id");
  CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_discussion_posts_id_idx" ON "payload_locked_documents_rels" USING btree ("discussion_posts_id");
  CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_ledger_id_idx" ON "payload_locked_documents_rels" USING btree ("ledger_id");
  CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_events_id_idx" ON "payload_locked_documents_rels" USING btree ("events_id");
  CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_users_id_idx" ON "payload_locked_documents_rels" USING btree ("users_id");
  CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_comments_id_idx" ON "payload_locked_documents_rels" USING btree ("comments_id");
  CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_media_id_idx" ON "payload_locked_documents_rels" USING btree ("media_id");
  CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_avatars_id_idx" ON "payload_locked_documents_rels" USING btree ("avatars_id");
  CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_companies_id_idx" ON "payload_locked_documents_rels" USING btree ("companies_id");
  CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_company_logos_id_idx" ON "payload_locked_documents_rels" USING btree ("company_logos_id");
  CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_products_id_idx" ON "payload_locked_documents_rels" USING btree ("products_id");
  CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_gift_shop_transactions_id_idx" ON "payload_locked_documents_rels" USING btree ("gift_shop_transactions_id");
  CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_verification_tokens_id_idx" ON "payload_locked_documents_rels" USING btree ("verification_tokens_id");
  CREATE INDEX IF NOT EXISTS "payload_preferences_key_idx" ON "payload_preferences" USING btree ("key");
  CREATE INDEX IF NOT EXISTS "payload_preferences_updated_at_idx" ON "payload_preferences" USING btree ("updated_at");
  CREATE INDEX IF NOT EXISTS "payload_preferences_created_at_idx" ON "payload_preferences" USING btree ("created_at");
  CREATE INDEX IF NOT EXISTS "payload_preferences_rels_order_idx" ON "payload_preferences_rels" USING btree ("order");
  CREATE INDEX IF NOT EXISTS "payload_preferences_rels_parent_idx" ON "payload_preferences_rels" USING btree ("parent_id");
  CREATE INDEX IF NOT EXISTS "payload_preferences_rels_path_idx" ON "payload_preferences_rels" USING btree ("path");
  CREATE INDEX IF NOT EXISTS "payload_preferences_rels_users_id_idx" ON "payload_preferences_rels" USING btree ("users_id");
  CREATE INDEX IF NOT EXISTS "payload_migrations_updated_at_idx" ON "payload_migrations" USING btree ("updated_at");
  CREATE INDEX IF NOT EXISTS "payload_migrations_created_at_idx" ON "payload_migrations" USING btree ("created_at");
  CREATE INDEX IF NOT EXISTS "guide_additional_info_order_idx" ON "guide_additional_info" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "guide_additional_info_parent_id_idx" ON "guide_additional_info" USING btree ("_parent_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "challenges" CASCADE;
  DROP TABLE "challenges_rels" CASCADE;
  DROP TABLE "discussion_posts" CASCADE;
  DROP TABLE "ledger" CASCADE;
  DROP TABLE "events" CASCADE;
  DROP TABLE "users_roles" CASCADE;
  DROP TABLE "users" CASCADE;
  DROP TABLE "comments" CASCADE;
  DROP TABLE "comments_rels" CASCADE;
  DROP TABLE "media" CASCADE;
  DROP TABLE "avatars" CASCADE;
  DROP TABLE "companies" CASCADE;
  DROP TABLE "company_logos" CASCADE;
  DROP TABLE "products" CASCADE;
  DROP TABLE "products_rels" CASCADE;
  DROP TABLE "gift_shop_transactions" CASCADE;
  DROP TABLE "verification_tokens" CASCADE;
  DROP TABLE "payload_locked_documents" CASCADE;
  DROP TABLE "payload_locked_documents_rels" CASCADE;
  DROP TABLE "payload_preferences" CASCADE;
  DROP TABLE "payload_preferences_rels" CASCADE;
  DROP TABLE "payload_migrations" CASCADE;
  DROP TABLE "guide_additional_info" CASCADE;
  DROP TABLE "guide" CASCADE;
  DROP TYPE "public"."enum_discussion_posts_status";
  DROP TYPE "public"."enum_events_date_time_zone";
  DROP TYPE "public"."enum_users_roles";
  DROP TYPE "public"."enum_users_login_method";
  DROP TYPE "public"."enum_comments_status";
  DROP TYPE "public"."enum_gift_shop_transactions_status";
  DROP TYPE "public"."enum_guide_additional_info_icon";`)
}
