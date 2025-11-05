alter table "public"."reviews" add column "iscleared" boolean default false;

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.update_cart_total()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
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
$function$
;


