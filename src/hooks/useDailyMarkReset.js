import { supabase } from "../supabaseClient";
import { formatDate } from "../utils/helper";
import { useLocalStorage } from "./useLocalStorage";

const useDailyMarkReset = (user) => {
  const [lastResetDate, setLastResetDate] = useLocalStorage("lastMarkReset", null);

  const resetMarksIfNeeded = async () => {
    if (!user) return;

    const today = new Date();
    const todayString = formatDate(today);

    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    const tommorowString = formatDate(tomorrow);

    // 🧠 If we already reset today — skip
    if (lastResetDate === todayString) {
      console.log("🟢 Marks already reset today, skipping...");
      return;
    }

    // 1️⃣ Fetch today's event
    const { data: event, error } = await supabase
      .from("events")
      .select("id, has_reset")
      .eq("user_id", user.id)
      .eq("event_date", tommorowString)
      .maybeSingle();

    if (error) {
      console.error("Error checking today's event:", error);
      return;
    }

    // 2️⃣ If event doesn’t exist, nothing to reset
    if (!event) return;

    // 3️⃣ Skip if already reset
    if (event.has_reset) {
      console.log("🟢 Marks already reset, skipping...");
      setLastResetDate(todayString); // cache that it's done
      return;
    }

    // 4️⃣ Fetch recipe IDs linked to this event
    const { data: eventRecipes, error: fetchError } = await supabase
      .from("event_recipes")
      .select("recipe_id")
      .eq("event_id", event.id);

    if (fetchError) {
      console.error("Error fetching event recipes:", fetchError);
      return;
    }

    const recipeIds = eventRecipes?.map((r) => r.recipe_id) || [];
    if (recipeIds.length === 0) return;

    // 5️⃣ Reset all marks for those recipes
    const { error: resetError } = await supabase
      .from("recipe_ingredients")
      .update({ mark: false })
      .in("recipe_id", recipeIds);

    if (resetError) {
      console.error("Error resetting marks:", resetError);
      return;
    }

    // 6️⃣ Mark event as reset in DB
    const { error: updateError } = await supabase
      .from("events")
      .update({ has_reset: true })
      .eq("id", event.id);

    if (updateError) {
      console.error("Error updating event reset flag:", updateError);
      return;
    }

    // 7️⃣ Save locally that we reset today
    setLastResetDate(todayString);

    console.log(`✅ Marks reset for event ${event.id} on ${todayString}`);
  };

  return resetMarksIfNeeded;
};

export default useDailyMarkReset;
