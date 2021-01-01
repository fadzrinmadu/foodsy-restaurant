const BASE_URL = 'http://127.0.0.1:8888';

document.addEventListener('DOMContentLoaded', async () => {
  const menuList = document.querySelectorAll('.menu-list');
  menuList.forEach((menu) => {
    menu.addEventListener('click', handleEvents);
  });

  const buttonOrder = document.querySelector('.summary-button .btn-order');
  buttonOrder.addEventListener('click', handleOrder);

  updateUISummary();
  updateUIMenuList();
});


/**
 * HANDLE EVENTS
 */

function handleEvents(event) {
  if (event.target.classList.contains('btn-increase')) {
    const menuId = event.target.dataset.id;
    const menuName = event.target.dataset.name;
    const menuPrice = event.target.dataset.price;
    const menuType = event.target.dataset.type;

    let menuOrderedAmount = getMenuOrderedAmount(menuId);

    const menuAmountElement = event.target.previousElementSibling;
    menuAmountElement.innerText = `${++menuOrderedAmount}`;
    
    if (!isMenuOrdered(menuId)) {
      createMenuOrdered({
        menuId, 
        menuName, 
        menuPrice, 
        menuType, 
        menuAmount: menuOrderedAmount 
      });
    } else {
      updateMenuOrdered({
        menuName,
        menuPrice,
        menuType,
        menuAmount: menuOrderedAmount,
      }, menuId);
    }

    updateUISummary();
  }

  if (event.target.classList.contains('btn-decrease')) {
    const menuId = event.target.dataset.id;
    const menuName = event.target.dataset.name;
    const menuPrice = event.target.dataset.price;
    const menuType = event.target.dataset.type;
    let menuAmountElement = event.target.nextElementSibling;

    let menuOrderedAmount = getMenuOrderedAmount(menuId);

    if (menuOrderedAmount <= 0) {
      menuAmountElement.innerText = `${menuOrderedAmount}`;
    } else {
      if (menuOrderedAmount === 1) {
        removeMenuOrdered(menuId);
      }
      menuAmountElement.innerText = `${--menuOrderedAmount}`;
      updateMenuOrdered({
        menuName,
        menuPrice,
        menuType,
        menuAmount: menuOrderedAmount,
      }, menuId);
    }

    updateUISummary();
  }
}

function handleOrder() {
  const menu = getMenuOrdered();

  if (menu.length > 0) {
    liff.getProfile()
      .then((profile) => {
        const name = profile.displayName;
      })
      .catch((err) => {
        console.log('error', err);
      });

    const menuFoodsAmount = sum(menu.filter((item) => item.type === 'food'), 'amount');
    const menuDrinksAmount = sum(menu.filter((item) => item.type === 'drink'), 'amount');
    const messageOrder = `Hai Customer,\n\nTerima kasih telah memesan makanan, berikut adalah review pesanannya:\n\n${(menuFoodsAmount !== 0) ? `*${menuFoodsAmount} Makanan\n` : ''}${(menuDrinksAmount !== 0) ? `*${menuDrinksAmount} Minuman` : ''}\n\nPesanan kakak akan segera diproses dan akan diberitahu jika sudah bisa diambil.\n\nMohon ditunggu ya!`

    if (!liff.isInClient()) {
      alert(messageOrder);
    } else {
      liff.sendMessages([{
        type: 'text',
        text: messageOrder,
      }])
      .then(() => {
        liff.closeWindow();
      })
      .catch((error) => {
        alert(error.message);
      });

    }

    clearMenuOrdered();
    
  } else {
    alert(`Hai Customer, anda belum memilih makanan yang akan dipesan!`);
  }
}

/**
 * MENU FUNCTIONS
 */

function getMenuList() {
  return [
    {
      "_id": "5fe9e371032c9564b81c1d21",
      "name": "Nasi / Mie Goreng Special",
      "price": 20000,
      "image": "images/foods/1.jpg",
      "type": "food"
    },
    {
      "_id": "5fe9e371032c9564b81c1d22",
      "name": "Nasi Goreng Ayam Bakar",
      "price": 18000,
      "image": "images/foods/2.jpg",
      "type": "food"
    },
    {
      "_id": "5fe9e371032c9564b81c1d23",
      "name": "Nasi / Mie Goreng Telur",
      "price": 12000,
      "image": "images/foods/3.jpg",
      "type": "food"
    },
    {
      "_id": "5fe9e371032c9564b81c1d24",
      "name": "Cappuccino",
      "price": 10000,
      "image": "images/drinks/1.jpg",
      "type": "drink"
    },
    {
      "_id": "5fe9e371032c9564b81c1d25",
      "name": "Es Teh Dingin",
      "price": 6000,
      "image": "images/drinks/2.jpg",
      "type": "drink"
    }
  ];
}

function getMenuOrdered() {
  return (localStorage.getItem('menu') === null)
    ? []
    : JSON.parse(localStorage.getItem('menu'));
}

function getMenuOrderedById(id) {
  const menu = getMenuOrdered();
  const menuFinded = menu.find((item) => item._id === id);
  return menuFinded;
}

function getMenuOrderedAmount(id) {
  const menu = getMenuOrdered();
  const menuFinded = menu.find((item) => item._id === id);
  return (menuFinded) ? menuFinded.amount : 0;
}

function createMenuOrdered(data) {
  let menu = getMenuOrdered();
  menu.push({
    _id: data.menuId,
    name: data.menuName,
    price: data.menuPrice,
    type: data.menuType,
    amount: data.menuAmount,
  });
  localStorage.setItem('menu', JSON.stringify(menu));
}

function updateMenuOrdered(data, id) {
  let menu = getMenuOrdered();
  menu.forEach((menu) => {
    if (menu._id === id) {
      menu.name = data.menuName;
      menu.price = data.menuPrice;
      menu.type = data.menuType;
      menu.amount = data.menuAmount;
    }
  });
  localStorage.setItem('menu', JSON.stringify(menu));
}

function removeMenuOrdered(id) {
  const menu = getMenuOrdered();
  const menuFilltered = menu.filter((item) => item._id !== id);
  localStorage.setItem('menu', JSON.stringify(menuFilltered));
}

function clearMenuOrdered() {
  localStorage.setItem('menu', JSON.stringify([]));
}

function calculateMenuOrdered() {
  const menu = getMenuOrdered();
  let total = 0;

  menu.forEach((item) => {
    total = total + item.price * item.amount;
  });
  return total;
}

function isMenuOrdered(id) {
  const menu = getMenuOrdered();
  return !!menu.find((item) => item._id === id);
}

/**
 * UI SCRIPTS
 */

function setMenuItemTemplate(items) {
  return items.map((item) => `
    <div class="menu-item card-panel white">
      <div class="menu-details">
        <img class="menu-image" src="${item.image}" alt="menu thumb">
        <div class="menu-description">
          <div class="menu-name">${item.name}</div>
          <div class="menu-price">${currencyFormatter(item.price)}</div>
        </div>
      </div>
      <div class="menu-action">
        <button 
          type="button" 
          class="btn btn-small btn-floating btn-decrease red darken-1"
          data-price="${item.price}"
          data-name="${item.name}"
          data-type="${item.type}"
          data-id="${item._id}"
        >
          <i class="material-icons">remove</i>
        </button>
        <span class="menu-amount">${getMenuOrderedAmount(item._id)}</span>
        <button 
          type="button" 
          class="btn btn-small btn-floating btn-increase green darken-1"
          data-price="${item.price}"
          data-name="${item.name}"
          data-type="${item.type}"
          data-id="${item._id}"
        >
          <i class="material-icons" readonly>add</i>
        </button>
      </div>
    </div>
  `).join('');
}

function updateUIMenuList() {
  const menu = getMenuList();
  const menuFoods = menu.filter((item) => item.type === 'food');
  const menuDrinks = menu.filter((item) => item.type === 'drink');
  const menuFoodsElement = document.querySelector('.menu-foods');
  const menuDrinksElement = document.querySelector('.menu-drinks');

  const menuFoodsTemplate = setMenuItemTemplate(menuFoods);
  const menuDrinksTemplate = setMenuItemTemplate(menuDrinks);
  menuFoodsElement.innerHTML = menuFoodsTemplate;
  menuDrinksElement.innerHTML = menuDrinksTemplate;
}

function updateUISummary() {
  const summaryDetails = document.querySelector('.summary-details');
  const menu = getMenuOrdered();
  let html = '';

  if (menu.length > 0) {
    const menuFoodsAmount = sum(menu.filter((item) => item.type === 'food'), 'amount');
    const menuDrinksAmount = sum(menu.filter((item) => item.type === 'drink'), 'amount');
    const menuFoodsAmountText = `${menuFoodsAmount} makanan`;
    const menuDrinksAmountText = `${menuDrinksAmount} minuman`;

    if (menuFoodsAmount && menuDrinksAmount) {
      html = `
        <p>Total: ${menuFoodsAmountText} & ${menuDrinksAmountText}.</p>
        <p>Harga: ${currencyFormatter(calculateMenuOrdered())}</p>
      `;
    } else {
      if (menuFoodsAmount !== 0) {
        html = `
          <p>Total: ${menuFoodsAmountText}</p>
          <p>Harga: ${currencyFormatter(calculateMenuOrdered())}</p>
        `;
      }
      if (menuDrinksAmount !== 0) {
        html = `
          <p>Total: ${menuDrinksAmountText}</p>
          <p>Harga: ${currencyFormatter(calculateMenuOrdered())}</p>
        `;
      }
    }
  } else {
    html = `
      <p>Total: -</p>
      <p>Harga: -</p>
    `;
  }

  summaryDetails.innerHTML = html;
}

/**
 * HELPERS
 */

function currencyFormatter(number) {
  const formatter = new Intl.NumberFormat('id-Id', {
    style: 'currency',
    currency: 'IDR',
    currncyDisplay: 'narrowSymbol',
    minimumFractionDigits: 0,
  });

  return formatter.format(number)
}

function sum(array, key) {
  return array.reduce((a, b) => a + (b[key] || 0), 0);
}
