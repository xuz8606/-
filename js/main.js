/**
 * 檸檬草美食茶房 LEMON GRASS FOOD & TEA
 * 核心前端互動腳本
 */

document.addEventListener("DOMContentLoaded", () => {
  // DOM 元素選取
  const menuGrid = document.getElementById("menuGrid");
  const categoryTabsContainer = document.getElementById("categoryTabs");
  const searchInput = document.getElementById("menuSearchInput");
  const hamburgerBtn = document.getElementById("hamburgerBtn");
  const mobileDrawer = document.getElementById("mobileDrawer");
  const mobileLinks = document.querySelectorAll(".mobile-nav-link");
  const backToTopBtn = document.getElementById("backToTopBtn");
  const siteHeader = document.querySelector(".site-header");
  const currentStatusBadge = document.getElementById("currentStatusBadge");

  // 餐點詳情 Modal 元素
  const foodModalOverlay = document.getElementById("foodModalOverlay");
  const modalCloseBtn = document.getElementById("modalCloseBtn");
  const modalHeroImg = document.getElementById("modalHeroImg");
  const modalTitle = document.getElementById("modalTitle");
  const modalEnTitle = document.getElementById("modalEnTitle");
  const modalPrice = document.getElementById("modalPrice");
  const modalTagsRow = document.getElementById("modalTagsRow");
  const modalFullDesc = document.getElementById("modalFullDesc");
  const modalIngredients = document.getElementById("modalIngredients");
  const modalPairing = document.getElementById("modalPairing");
  const modalDietary = document.getElementById("modalDietary");
  const modalServing = document.getElementById("modalServing");

  // 當前篩選分類狀態
  let currentCategory = "all";
  let searchQuery = "";

  // 1. 初始化分類標籤按鈕
  function renderCategoryTabs() {
    if (!categoryTabsContainer) return;
    categoryTabsContainer.innerHTML = categories.map(cat => `
      <button class="cat-tab-btn ${cat.id === currentCategory ? 'active' : ''}" data-cat="${cat.id}">
        <span>${cat.icon}</span>
        <span>${cat.name}</span>
      </button>
    `).join("");

    // 綁定點擊事件
    const tabBtns = categoryTabsContainer.querySelectorAll(".cat-tab-btn");
    tabBtns.forEach(btn => {
      btn.addEventListener("click", () => {
        tabBtns.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        currentCategory = btn.getAttribute("data-cat");
        renderMenuCards();
      });
    });
  }

  // 2. 渲染餐點卡片清單
  function renderMenuCards() {
    if (!menuGrid) return;

    let filtered = menuData.filter(item => {
      // 分類過濾
      let matchCategory = true;
      if (currentCategory === "popular") {
        matchCategory = item.isPopular === true;
      } else if (currentCategory !== "all") {
        matchCategory = item.category === currentCategory;
      }

      // 關鍵字搜尋過濾 (搜尋名稱、英文、描述或食材)
      let matchSearch = true;
      if (searchQuery.trim() !== "") {
        const query = searchQuery.toLowerCase().trim();
        const inName = item.name.toLowerCase().includes(query);
        const inEnName = item.enName.toLowerCase().includes(query);
        const inDesc = item.shortDesc.toLowerCase().includes(query) || item.fullDesc.toLowerCase().includes(query);
        const inIngredients = item.ingredients.some(ing => ing.toLowerCase().includes(query));
        matchSearch = inName || inEnName || inDesc || inIngredients;
      }

      return matchCategory && matchSearch;
    });

    if (filtered.length === 0) {
      menuGrid.innerHTML = `
        <div class="menu-empty-state">
          <div class="empty-icon">🍃</div>
          <h3 style="font-size: 1.25rem; margin-bottom: 8px;">未找到符合條件的餐點</h3>
          <p style="color: var(--color-text-muted); font-size: 0.95rem;">請嘗試不同關鍵字搜尋，或切換其他分類標籤查看更多美味。</p>
        </div>
      `;
      return;
    }

    menuGrid.innerHTML = filtered.map(food => {
      const catObj = categories.find(c => c.id === food.category);
      const catName = catObj ? catObj.name : "精選美味";

      return `
        <article class="food-card" data-id="${food.id}" tabindex="0" role="button" aria-label="點擊查看 ${food.name} 詳細介紹">
          <div class="food-card-img-wrap">
            <img class="food-card-img" src="${food.image}" alt="${food.name}" loading="lazy" onerror="this.onerror=null;this.src='https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80';" />
            <div class="food-tags-badge-group">
              ${food.isPopular ? `<span class="food-badge food-badge-popular">★ 人氣推薦</span>` : ''}
              ${food.tags.slice(0, 2).map(t => `<span class="food-badge food-badge-tag">${t}</span>`).join('')}
            </div>
          </div>
          <div class="food-card-body">
            <span class="food-category-label">${catName}</span>
            <h3 class="food-card-title">${food.name}</h3>
            <div class="food-card-en-title">${food.enName}</div>
            <p class="food-card-desc">${food.shortDesc}</p>
            <div class="food-card-footer">
              <div class="food-price-wrap">
                <span class="food-price-currency">NT$</span>
                <span class="food-price-num">${food.price}</span>
              </div>
              <span class="view-detail-btn">
                詳細介紹 →
              </span>
            </div>
          </div>
        </article>
      `;
    }).join("");

    // 為每張卡片綁定彈窗開啟事件
    const cards = menuGrid.querySelectorAll(".food-card");
    cards.forEach(card => {
      const openDetail = () => {
        const foodId = card.getAttribute("data-id");
        openFoodModal(foodId);
      };
      card.addEventListener("click", openDetail);
      card.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          openDetail();
        }
      });
    });
  }

  // 3. 打開餐點詳細介紹 Modal
  function openFoodModal(foodId) {
    const item = menuData.find(f => f.id === foodId);
    if (!item) return;

    modalHeroImg.src = item.image;
    modalHeroImg.alt = item.name;
    modalTitle.textContent = item.name;
    modalEnTitle.textContent = item.enName;
    modalPrice.textContent = item.price;

    // 標籤
    modalTagsRow.innerHTML = [
      ...(item.isPopular ? ['⭐ 人氣招牌'] : []),
      ...item.tags,
      item.dietary
    ].map(tag => `<span class="food-badge food-badge-popular">${tag}</span>`).join("");

    modalFullDesc.textContent = item.fullDesc;

    // 嚴選食材
    modalIngredients.innerHTML = item.ingredients.map(ing => `
      <span class="ingredient-pill">🌿 ${ing}</span>
    `).join("");

    // 推薦茶飲搭檔
    modalPairing.innerHTML = `<strong>💡 主廚推薦搭檔：</strong>${item.pairing}`;

    // 份量規格
    modalServing.textContent = item.serving || "標準一人份套餐規格";

    // 飲食友善
    modalDietary.textContent = item.dietary || "葷食";

    foodModalOverlay.classList.add("open");
    document.body.style.overflow = "hidden";
  }

  // 關閉餐點 Modal
  function closeFoodModal() {
    if (foodModalOverlay) {
      foodModalOverlay.classList.remove("open");
      document.body.style.overflow = "";
    }
  }

  if (modalCloseBtn) {
    modalCloseBtn.addEventListener("click", closeFoodModal);
  }

  if (foodModalOverlay) {
    foodModalOverlay.addEventListener("click", (e) => {
      if (e.target === foodModalOverlay) {
        closeFoodModal();
      }
    });
  }

  // 4. 關鍵字搜尋監聽 (Debounced)
  let searchTimeout;
  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(() => {
        searchQuery = e.target.value;
        renderMenuCards();
      }, 200);
    });
  }

  // 5. 手機版漢堡選單抽屜
  if (hamburgerBtn && mobileDrawer) {
    hamburgerBtn.addEventListener("click", () => {
      const isOpen = mobileDrawer.classList.toggle("open");
      hamburgerBtn.classList.toggle("is-active", isOpen);
      hamburgerBtn.setAttribute("aria-expanded", isOpen);
    });

    mobileLinks.forEach(link => {
      link.addEventListener("click", () => {
        mobileDrawer.classList.remove("open");
        hamburgerBtn.classList.remove("is-active");
      });
    });
  }

  // 6. 即時營業狀態判斷
  function updateBusinessStatus() {
    if (!currentStatusBadge) return;
    const now = new Date();
    const currentHour = now.getHours();

    // 營業時間：早上 10:00 至 凌晨 06:00（週一至週日跨日營業）
    const isOpen = currentHour >= 10 || currentHour < 6;

    if (isOpen) {
      currentStatusBadge.innerHTML = `
        <span class="status-dot" style="background-color: #55efc4;"></span>
        <span>今日營業中 (10:00 - 凌晨 06:00)</span>
      `;
    } else {
      currentStatusBadge.innerHTML = `
        <span class="status-dot" style="background-color: #ff7675;"></span>
        <span>目前休息中 (10:00 開始營業)</span>
      `;
    }
  }

  // 7. ESC 關閉餐點彈窗
  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      closeFoodModal();
    }
  });

  // 8. 滾動偵測與返回頂部
  window.addEventListener("scroll", () => {
    const scrollY = window.scrollY;

    // Header 陰影
    if (scrollY > 50) {
      siteHeader.style.boxShadow = "0 4px 20px rgba(43, 49, 39, 0.08)";
    } else {
      siteHeader.style.boxShadow = "none";
    }

    // 回頂部按鈕顯隱
    if (backToTopBtn) {
      if (scrollY > 400) {
        backToTopBtn.classList.add("visible");
      } else {
        backToTopBtn.classList.remove("visible");
      }
    }
  });

  if (backToTopBtn) {
    backToTopBtn.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  // 初始化啟動
  renderCategoryTabs();
  renderMenuCards();
  updateBusinessStatus();
});
