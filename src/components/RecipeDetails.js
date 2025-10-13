import React, { useEffect, useMemo, useState } from "react";
import { supabase } from "../supabaseClient";
import { useTheme } from "../contexts/ThemeContext";
import { LinearLoader, Modal, Table } from "./components";
import { formatNumber, getWeightText } from "../utils/helper";

export default function RecipeDetails({ user, recipe, onClose = () => { } }) {
  const { theme } = useTheme();

  const [loading, setLoading] = useState(false);
  const [recipeData, setRecipeData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!recipe?.recipeId) {
      setRecipeData(null);
      setError(null);
      return;
    }

    let cancelled = false;
    const fetchRecipe = async () => {
      try {
        setLoading(true);
        setError(null);

        const { data, error: fetchError } = await supabase
          .from("recipes")
          .select(
            `id, name, sellingprice, doughweight, active,
            recipe_ingredients(
              id, ingredient_id, bakerspercent, inventory(id, ingredient, qty)
            )`
          )
          .eq("id", recipe?.recipeId)
          .eq("user_id", user?.id)
          .maybeSingle();

        if (fetchError) throw fetchError;
        if (!cancelled) setRecipeData(data || null);
      } catch (err) {
        console.error(err);
        if (!cancelled) setError(err.message || "Failed to load recipe");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchRecipe();
    return () => {
      cancelled = true;
    };
  }, [recipe]);

  const scaledIngredients = useMemo(() => {
    if (!recipeData?.recipe_ingredients) return [];
    const totalPercent = recipeData.recipe_ingredients.reduce((sum, ing) => sum + (Number(ing.bakerspercent) || 0), 0);
    const doughWeight = Number(recipeData.doughweight) || 0;
    const multiplier = Number(recipe?.qty) || 1;

    return recipeData.recipe_ingredients.map((ri) => {
      const percent = Number(ri.bakerspercent) || 0;
      const weight = (percent / 100) * (doughWeight / (totalPercent / 100)) * multiplier;
      return {
        ...ri,
        displayName: ri.inventory?.ingredient || `ingredient #${ri.ingredient_id}`,
        weight,
      };
    });
  }, [recipeData, recipe?.qty]);

  if (!recipe?.recipeId) return null;

  const styles = {
    card: {
      flex: 1,
      background: theme.colors.activeButtonBg,
      padding: 12,
      borderRadius: theme.borderRadius.navbar,
    }
  };

  return (
    <Modal title={recipeData?.name} handleClose={onClose}><div style={{ padding: 20, overflowY: "auto", maxHeight: "75vh", zIndex: 9999 }}>
      {loading ? (
        <LinearLoader />
      ) : error ? (
        <div style={{ color: theme.accent.error }}>{error}</div>
      ) : !recipeData ? (
        <div style={{ color: theme.colors.textSecondary }}>No recipe found.</div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Info boxes */}
          <div style={{ display: "flex", gap: 16 }}>
            <div style={styles.card}>
              <div style={{ fontSize: 12, color: theme.colors.textSecondary }}>מחיר מכירה (יחידה / כולל)</div>
              <div style={{ fontSize: 16, fontWeight: 600 }}>{formatNumber(recipeData.sellingprice, 0) ?? "-"} ₪ / {formatNumber(recipeData.sellingprice * recipe?.qty, 0) ?? "-"} ₪</div>
            </div>
            <div style={styles.card}>
              <div style={{ fontSize: 12, color: theme.colors.textSecondary }}>משקל בצק (יחידה / כולל)</div>
              <div style={{ fontSize: 16, fontWeight: 600 }}>{getWeightText(recipeData?.doughweight)} / {getWeightText(recipeData?.doughweight * recipe?.qty)}</div>
            </div>
          </div>

          {/* Ingredients table */}
          <div
            style={{
              border: "1px solid rgba(0,0,0,0.1)",
              borderRadius: theme.borderRadius.navbar,
              overflowX: "auto",
            }}
          >
            <Table
              title="טבלת רכיבים"
              sortable={true}
              headers={[
                { key: 'displayName', label: 'מרכיב' },
                {
                  key: 'bakerspercent',
                  label: 'אחוזי בייקר',
                  render: (value, _) => `${value}%`
                },
                {
                  key: 'weight',
                  label: 'משקל',
                  sortable: true,
                  render: (value, _) => getWeightText(value)
                }
              ]}
              data={scaledIngredients}
            />
          </div>
        </div>
      )}
    </div>
    </Modal>
  );
}
