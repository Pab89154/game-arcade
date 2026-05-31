(function () {
  var CAT_COLORS = {
    base: { bg: "rgba(0, 187, 249, 0.12)", accent: "#00bbf9" },
    dairy: { bg: "rgba(255, 183, 3, 0.15)", accent: "#ffb703" },
    protein: { bg: "rgba(239, 71, 111, 0.12)", accent: "#ef476f" },
    veg: { bg: "rgba(6, 214, 160, 0.12)", accent: "#06d6a0" },
    fruit: { bg: "rgba(255, 107, 107, 0.12)", accent: "#ff6b6b" },
    sweet: { bg: "rgba(131, 56, 236, 0.12)", accent: "#8338ec" },
    spice: { bg: "rgba(255, 120, 0, 0.12)", accent: "#ff7800" },
    top: { bg: "rgba(255, 45, 170, 0.1)", accent: "#ff2daa" },
  };

  var INGREDIENTS = [
    { id: "flour", n: "Flour", e: "🌾", c: "base", fact: "Flour comes from ground-up grains like wheat!" },
    { id: "bread", n: "Bread", e: "🍞", c: "base", fact: "Bread has been baked for thousands of years." },
    { id: "rice", n: "Rice", e: "🍚", c: "base", fact: "Rice feeds more people on Earth than any other grain." },
    { id: "tortilla", n: "Tortilla", e: "🌮", c: "base", fact: "Tortillas are soft flat breads used in tacos and burritos." },
    { id: "pasta", n: "Pasta", e: "🍝", c: "base", fact: "Italy has over 300 pasta shapes!" },
    { id: "potato", n: "Potato", e: "🥔", c: "base", fact: "Potatoes were first grown in the Andes mountains." },
    { id: "egg", n: "Egg", e: "🥚", c: "dairy", fact: "Eggs help baked goods rise and hold together." },
    { id: "milk", n: "Milk", e: "🥛", c: "dairy", fact: "Milk is full of calcium for strong bones." },
    { id: "butter", n: "Butter", e: "🧈", c: "dairy", fact: "Butter is made by churning cream." },
    { id: "cheese", n: "Cheese", e: "🧀", c: "dairy", fact: "There are over 1,800 types of cheese in the world." },
    { id: "cream", n: "Cream", e: "🍦", c: "dairy", fact: "Heavy cream makes sauces silky and rich." },
    { id: "yogurt", n: "Yogurt", e: "🫕", c: "dairy", fact: "Yogurt is made when friendly bacteria ferment milk." },
    { id: "chicken", n: "Chicken", e: "🍗", c: "protein", fact: "Chicken is one of the most popular meats worldwide." },
    { id: "beef", n: "Beef", e: "🥩", c: "protein", fact: "Beef comes from cattle and is rich in protein." },
    { id: "fish", n: "Fish", e: "🐟", c: "protein", fact: "Fish is a great source of healthy omega fats." },
    { id: "beans", n: "Beans", e: "🫘", c: "protein", fact: "Beans are tiny protein powerhouses from plants." },
    { id: "shrimp", n: "Shrimp", e: "🍤", c: "protein", fact: "Shrimp cook very fast — watch them turn pink!" },
    { id: "bacon", n: "Bacon", e: "🥓", c: "protein", fact: "Bacon is cured and smoked pork belly." },
    { id: "tomato", n: "Tomato", e: "🍅", c: "veg", fact: "Tomatoes are fruits, but we cook them like veggies." },
    { id: "lettuce", n: "Lettuce", e: "🥬", c: "veg", fact: "Lettuce is mostly water — super crunchy and fresh!" },
    { id: "onion", n: "Onion", e: "🧅", c: "veg", fact: "Onions add flavor and can make you tear up when you chop them." },
    { id: "carrot", n: "Carrot", e: "🥕", c: "veg", fact: "Carrots have beta-carotene, which is good for your eyes." },
    { id: "corn", n: "Corn", e: "🌽", c: "veg", fact: "Corn was first grown by people in Mexico long ago." },
    { id: "pepper", n: "Pepper", e: "🫑", c: "veg", fact: "Bell peppers can be red, yellow, green, or orange." },
    { id: "pickle", n: "Pickle", e: "🥒", c: "veg", fact: "Pickles are cucumbers soaked in salty brine." },
    { id: "mushroom", n: "Mushroom", e: "🍄", c: "veg", fact: "Mushrooms are fungi — they grow in damp, shady places." },
    { id: "olive", n: "Olive", e: "🫒", c: "veg", fact: "Olives are pressed to make olive oil." },
    { id: "apple", n: "Apple", e: "🍎", c: "fruit", fact: "There are over 7,500 kinds of apples in the world." },
    { id: "banana", n: "Banana", e: "🍌", c: "fruit", fact: "Bananas are berries — botanically speaking!" },
    { id: "strawberry", n: "Strawberry", e: "🍓", c: "fruit", fact: "Strawberries are the only fruit with seeds on the outside." },
    { id: "grapes", n: "Grapes", e: "🍇", c: "fruit", fact: "Grapes can be eaten fresh or dried into raisins." },
    { id: "orange", n: "Orange", e: "🍊", c: "fruit", fact: "Oranges are famous for vitamin C." },
    { id: "peach", n: "Peach", e: "🍑", c: "fruit", fact: "Peaches have fuzzy skin and a big pit inside." },
    { id: "pineapple", n: "Pineapple", e: "🍍", c: "fruit", fact: "Pineapples take almost two years to grow one fruit." },
    { id: "mango", n: "Mango", e: "🥭", c: "fruit", fact: "Mangoes are called the king of fruits in India." },
    { id: "lemon", n: "Lemon", e: "🍋", c: "fruit", fact: "Lemon juice is sour because of citric acid." },
    { id: "chocolate", n: "Chocolate", e: "🍫", c: "sweet", fact: "Chocolate starts as beans from the cacao tree." },
    { id: "honey", n: "Honey", e: "🍯", c: "sweet", fact: "Bees make honey from flower nectar." },
    { id: "candy", n: "Candy", e: "🍬", c: "sweet", fact: "Hard candy is cooked sugar cooled into shapes." },
    { id: "frosting", n: "Frosting", e: "🧁", c: "sweet", fact: "Frosting makes cakes look fancy and taste sweeter." },
    { id: "cookie", n: "Cookie", e: "🍪", c: "sweet", fact: "The word cookie comes from the Dutch word koekje." },
    { id: "salt", n: "Salt", e: "🧂", c: "spice", fact: "Salt brings out flavor in almost every dish." },
    { id: "chili", n: "Chili", e: "🌶️", c: "spice", fact: "Chili peppers contain capsaicin — that's the heat!" },
    { id: "garlic", n: "Garlic", e: "🧄", c: "spice", fact: "Garlic adds a bold smell and taste when cooked." },
    { id: "basil", n: "Basil", e: "🍃", c: "spice", fact: "Basil is a fragrant herb used in Italian cooking." },
    { id: "ginger", n: "Ginger", e: "🫚", c: "spice", fact: "Ginger root adds warm, zippy flavor to dishes." },
    { id: "peanut", n: "Peanut", e: "🥜", c: "top", fact: "Peanuts are legumes, not true nuts." },
    { id: "nut", n: "Nut", e: "🌰", c: "top", fact: "Nuts are packed with healthy fats and crunch." },
    { id: "crunch", n: "Crunch", e: "🥨", c: "top", fact: "Crunchy toppings make soft food more fun to eat." },
    { id: "ice", n: "Ice", e: "🧊", c: "top", fact: "Ice chills drinks and makes smoothies frosty." },
    { id: "berry", n: "Berry", e: "🫐", c: "top", fact: "Blueberries are one of the few naturally blue foods." },
    { id: "sprinkles", n: "Sprinkles", e: "⭐", c: "top", fact: "Sprinkles are tiny sugar decorations for desserts." },
  ];

  var CATEGORIES = [
    { id: "base", label: "🍞 Base" },
    { id: "protein", label: "🍗 Protein" },
    { id: "veg", label: "🥬 Veggies" },
    { id: "fruit", label: "🍎 Fruit" },
    { id: "dairy", label: "🧀 Dairy" },
    { id: "sweet", label: "🍬 Sweet" },
    { id: "spice", label: "🌶️ Spice" },
    { id: "top", label: "✨ Toppings" },
  ];

  var TOOLS = [
    { id: "bowl", name: "Mixing bowl", e: "🥣" },
    { id: "pan", name: "Frying pan", e: "🍳" },
    { id: "pot", name: "Soup pot", e: "🍲" },
    { id: "oven", name: "Oven", e: "🔥" },
    { id: "blender", name: "Blender", e: "🌀" },
    { id: "grill", name: "Grill", e: "🥙" },
    { id: "fridge", name: "Fridge", e: "❄️" },
  ];

  var CUSTOMERS = ["👧", "👦", "🧑", "👩", "🧒", "👱"];

  var RECIPES = [
    {
      name: "Chocolate Chip Cookies",
      region: "USA",
      diff: 1,
      customer: "Sam",
      tip: "Butter makes cookies chewy and delicious!",
      finish: "oven",
      dishColor: "#8D6E63",
      steps: [
        { id: "flour", tool: "bowl" },
        { id: "butter", tool: "bowl" },
        { id: "egg", tool: "bowl" },
        { id: "chocolate", tool: "bowl" },
      ],
    },
    {
      name: "Strawberry Smoothie",
      region: "USA",
      diff: 1,
      customer: "Mia",
      tip: "Add ice to make it extra frosty!",
      finish: "blender",
      dishColor: "#E91E63",
      steps: [
        { id: "strawberry", tool: "blender" },
        { id: "banana", tool: "blender" },
        { id: "milk", tool: "blender" },
        { id: "ice", tool: "blender" },
      ],
    },
    {
      name: "Margherita Pizza",
      region: "Italy",
      diff: 2,
      customer: "Marco",
      tip: "Fresh basil goes on after baking!",
      finish: "oven",
      dishColor: "#F44336",
      steps: [
        { id: "flour", tool: "bowl" },
        { id: "tomato", tool: "bowl" },
        { id: "cheese", tool: "bowl" },
        { id: "basil", tool: "bowl" },
      ],
    },
    {
      name: "Pancake Stack",
      region: "USA",
      diff: 1,
      customer: "Alex",
      tip: "Flip when you see bubbles on top!",
      finish: "pan",
      dishColor: "#FFB703",
      steps: [
        { id: "flour", tool: "bowl" },
        { id: "egg", tool: "bowl" },
        { id: "milk", tool: "bowl" },
        { id: "butter", tool: "pan" },
      ],
    },
    {
      name: "Rainbow Fruit Salad",
      region: "Anywhere",
      diff: 1,
      customer: "Riley",
      tip: "Use lots of bright colors!",
      finish: "fridge",
      dishColor: "#06D6A0",
      steps: [
        { id: "apple", tool: "bowl" },
        { id: "grapes", tool: "bowl" },
        { id: "orange", tool: "bowl" },
        { id: "banana", tool: "bowl" },
        { id: "strawberry", tool: "bowl" },
      ],
    },
    {
      name: "Grilled Cheese",
      region: "USA",
      diff: 1,
      customer: "Jordan",
      tip: "Low heat melts the cheese perfectly!",
      finish: "pan",
      dishColor: "#FFC107",
      steps: [
        { id: "bread", tool: "bowl" },
        { id: "cheese", tool: "bowl" },
        { id: "butter", tool: "pan" },
      ],
    },
    {
      name: "Veggie Tacos",
      region: "Mexico",
      diff: 2,
      customer: "Sofia",
      tip: "A squeeze of lime at the end!",
      finish: "grill",
      dishColor: "#FF5722",
      steps: [
        { id: "tortilla", tool: "bowl" },
        { id: "lettuce", tool: "bowl" },
        { id: "tomato", tool: "bowl" },
        { id: "cheese", tool: "bowl" },
        { id: "chili", tool: "bowl" },
      ],
    },
    {
      name: "Chicken Stir-Fry",
      region: "China",
      diff: 2,
      customer: "Wei",
      tip: "Keep the pan hot and keep stirring!",
      finish: "pan",
      dishColor: "#795548",
      steps: [
        { id: "chicken", tool: "pan" },
        { id: "pepper", tool: "pan" },
        { id: "carrot", tool: "pan" },
        { id: "onion", tool: "pan" },
        { id: "rice", tool: "pot" },
        { id: "ginger", tool: "pan" },
      ],
    },
    {
      name: "Tomato Pasta",
      region: "Italy",
      diff: 1,
      customer: "Luca",
      tip: "Save a splash of pasta water for the sauce!",
      finish: "pot",
      dishColor: "#D84315",
      steps: [
        { id: "pasta", tool: "pot" },
        { id: "tomato", tool: "pot" },
        { id: "garlic", tool: "pot" },
        { id: "basil", tool: "bowl" },
        { id: "cheese", tool: "bowl" },
      ],
    },
    {
      name: "Berry Parfait",
      region: "France",
      diff: 1,
      customer: "Claire",
      tip: "Layer yogurt and fruit for a fancy look!",
      finish: "fridge",
      dishColor: "#9C27B0",
      steps: [
        { id: "yogurt", tool: "bowl" },
        { id: "strawberry", tool: "bowl" },
        { id: "berry", tool: "bowl" },
        { id: "honey", tool: "bowl" },
      ],
    },
    {
      name: "Miso Soup Bowl",
      region: "Japan",
      diff: 2,
      customer: "Yuki",
      tip: "Simmer gently — don't boil too hard!",
      finish: "pot",
      dishColor: "#607D8B",
      steps: [
        { id: "mushroom", tool: "pot" },
        { id: "onion", tool: "pot" },
        { id: "fish", tool: "pot" },
        { id: "ginger", tool: "pot" },
      ],
    },
    {
      name: "Grilled Fish Plate",
      region: "Greece",
      diff: 2,
      customer: "Niko",
      tip: "A squeeze of lemon makes it shine!",
      finish: "grill",
      dishColor: "#0288D1",
      steps: [
        { id: "fish", tool: "grill" },
        { id: "lemon", tool: "bowl" },
        { id: "potato", tool: "oven" },
        { id: "olive", tool: "bowl" },
      ],
    },
  ];

  var byId = {};
  INGREDIENTS.forEach(function (ing) { byId[ing.id] = ing; });

  var toolById = {};
  TOOLS.forEach(function (t) { toolById[t.id] = t; });

  function ingById(id) {
    return byId[id] || { id: id, n: id, e: "🍽️", c: "base", fact: "Yummy!" };
  }

  function ingChip(id, className) {
    var ing = ingById(id);
    var colors = CAT_COLORS[ing.c] || CAT_COLORS.base;
    var cls = "ing-chip" + (className ? " " + className : "");
    return (
      '<span class="' + cls + '" style="border-color:' + colors.accent + ";background:" + colors.bg + '">' +
      '<span class="ing-chip__emoji">' + ing.e + "</span>" +
      '<span class="ing-chip__name">' + ing.n + "</span></span>"
    );
  }

  function leoAvatar() {
    return '<div class="avatar chef-leo" aria-hidden="true">👨‍🍳</div>';
  }

  function customerAvatar(variant) {
    var e = CUSTOMERS[variant % CUSTOMERS.length];
    return '<div class="avatar customer" aria-hidden="true">' + e + "</div>";
  }

  function toolIcon(id) {
    var t = toolById[id];
    return '<span class="tool-emoji">' + (t ? t.e : "🍽️") + "</span>";
  }

  function dishPlate(name) {
    return (
      '<div class="dish-plate">' +
      '<span class="dish-emoji">🍽️</span>' +
      '<span class="dish-name">' + name + "</span></div>"
    );
  }

  function particleHtml(kind) {
    var colors = {
      sparkle: "#FFD700",
      sizzle: "#FF7043",
      steam: "#B0BEC5",
      blend: "#8E24AA",
    };
    var c = colors[kind] || colors.sparkle;
    return '<span class="fx-dot" style="background:' + c + '"></span>';
  }

  window.KitchenVisuals = {
    CAT_COLORS: CAT_COLORS,
    INGREDIENTS: INGREDIENTS,
    CATEGORIES: CATEGORIES,
    TOOLS: TOOLS,
    RECIPES: RECIPES,
    ingById: ingById,
    ingChip: ingChip,
    leoAvatar: leoAvatar,
    customerAvatar: customerAvatar,
    toolIcon: toolIcon,
    toolSvg: toolIcon,
    leoSvg: leoAvatar,
    customerSvg: customerAvatar,
    dishPlate: dishPlate,
    particleHtml: particleHtml,
  };
})();
