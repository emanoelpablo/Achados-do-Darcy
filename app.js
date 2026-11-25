(() => {
  const byId = (id) => document.getElementById(id);
  const tabs = [...document.querySelectorAll('[role="tab"]')];
  const form = byId("register");
  const name = byId("item-name");
  const place = byId("item-place");
  const category = byId("item-category");
  const filter = byId("filter");
  const feedback = byId("form-feedback");
  const fields = [
    [name, "Informe o nome do objeto."],
    [place, "Informe onde o objeto foi encontrado."],
    [category, "Selecione a categoria do objeto."]
  ];
  const examples = [
    { name: "Caderno verde", place: "Sala de leitura", category: "Material escolar" },
    { name: "Estojo preto", place: "Laboratório", category: "Material escolar" },
    { name: "Boné branco", place: "Quadra", category: "Acessórios" }
  ];
  let items = [...examples];

  function selectTab(active, focus = true) {
    for (const tab of tabs) {
      const selected = tab === active;
      tab.setAttribute("aria-selected", String(selected));
      tab.tabIndex = selected ? 0 : -1;
      byId(tab.getAttribute("aria-controls")).hidden = !selected;
    }
    if (focus) active.focus();
  }

  function clearFeedback() {
    feedback.textContent = "";
    delete feedback.dataset.error;
    for (const [field] of fields) field.removeAttribute("aria-invalid");
  }

  function renderItems() {
    const categoryFilter = filter.value;
    const visible = items.filter((item) => !categoryFilter || item.category === categoryFilter);
    byId("catalog-count").textContent = visible.length === 0
      ? "Nenhum objeto encontrado nesta categoria."
      : visible.length === 1 ? "1 objeto encontrado" : `${visible.length} objetos encontrados`;
    byId("items").replaceChildren(...visible.map((item) => {
      const row = document.createElement("li");
      const title = document.createElement("strong");
      const info = document.createElement("span");
      title.textContent = item.name;
      info.textContent = `${item.place} · ${item.category}`;
      row.append(title, info);
      return row;
    }));
  }

  function loadExample(includeName) {
    name.value = includeName ? "Garrafa azul" : "";
    place.value = "Pátio";
    category.value = "Garrafas";
    clearFeedback();
  }

  tabs.forEach((tab, index) => {
    tab.addEventListener("click", () => selectTab(tab));
    tab.addEventListener("keydown", (event) => {
      const targets = {
        ArrowLeft: (index + tabs.length - 1) % tabs.length,
        ArrowRight: (index + 1) % tabs.length,
        Home: 0,
        End: tabs.length - 1
      };
      if (!Object.hasOwn(targets, event.key)) return;
      event.preventDefault();
      selectTab(tabs[targets[event.key]]);
    });
  });

  for (const button of document.querySelectorAll("[data-step]")) {
    button.addEventListener("click", () => {
      selectTab(byId(button.dataset.step));
      if (button.hasAttribute("data-try-validation")) {
        loadExample(false);
        form.requestSubmit();
      }
    });
  }

  byId("fill").addEventListener("click", () => {
    loadExample(true);
    name.focus();
  });
  filter.addEventListener("change", renderItems);
  form.addEventListener("input", clearFeedback);
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    clearFeedback();
    const invalid = fields.find(([field]) => !field.value.trim());
    if (invalid) {
      const [field, message] = invalid;
      field.setAttribute("aria-invalid", "true");
      feedback.dataset.error = "true";
      feedback.textContent = message;
      field.focus();
      return;
    }

    const item = { name: name.value.trim(), place: place.value.trim(), category: category.value };
    items.unshift(item);
    const wasHidden = filter.value && filter.value !== item.category;
    if (wasHidden) filter.value = "";
    renderItems();
    form.reset();
    feedback.textContent = wasHidden
      ? "Objeto cadastrado. O filtro foi limpo para mostrar o novo item."
      : "Objeto cadastrado. Confira a lista de objetos encontrados.";
  });

  byId("reset").addEventListener("click", () => {
    items = [...examples];
    form.reset();
    filter.value = "";
    clearFeedback();
    renderItems();
    selectTab(tabs[0]);
    byId("demo-status").textContent = "Demonstração reiniciada.";
  });

  renderItems();
})();
