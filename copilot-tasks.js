// TODO: Autocomplete inteligente com base em histórico e categorias
// - When user types an item name (e.g., "ban"), suggest items like "banana", "batata", "bandeja".
// - Suggestions should include category tags like [Hortifruti] or [Limpeza].
// - Use a predefined list of popular items with categories (as fallback).
// - Later, integrate this with user's item history for better personalization.


// TODO: Dynamic category detection with explanation
// - When the user types an item, automatically detect the category using keyword analysis.
// - Show the detected category next to the item field as "Detected Category: Hortifruti".
// - Use the existing 'detectarCategoriaAutomatica' function.
// - Highlight the category in green or as a tag below the input.


// TODO: Add a category filter on the shopping list screen
// - Create a dropdown menu or category filter bar above the list.
// - When user selects a category (e.g., "Bebidas"), only show items from that category.
// - If "All" is selected, show all items.


// TODO: Train category detection with usage
// - Save each item the user adds and the category chosen.
// - When the same item is added in the future, use the most frequent category used.
// - Update the keyword-to-category list over time based on user habits (save in localStorage or database).


// TODO: Suggest known items while typing using a datalist
// - In HTML, create a <datalist id="itemSuggestions"> and link it to the item input.
// - In JS, fill it dynamically with the most used or predefined items.
// - Add options like <option value="banana"> and <option value="sabão">.


// TODO: Add voice input (optional advanced feature)
// - Let user press a microphone button to dictate the item name.
// - Use Web Speech API to convert voice to text and auto-fill the item name.
// - After recognition, apply category detection as usual.
