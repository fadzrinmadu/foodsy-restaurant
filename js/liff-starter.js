window.onload = () => {
  const useNodeJS = false;
  const defaultLiffId = '1655450299-pq76YXlw';

  let myLiffId = '';

  if (useNodeJS) {
    fetch('/send-id')
      .then((response) => response.json())
      .then((data) => {
        myLiffId = data.id;
        initializeLiff(myLiffId);
      })
      .catch((error) => console.log(error));
  } else {
    myLiffId = defaultLiffId;
    initializeLiff(myLiffId);
  }
};

function initializeLiff(myLiffId) {
  liff.init({ liffId: myLiffId })
    .then(() => {
      initilizeApp();
    });
}

function initilizeApp() {
  registerButtonHandlers();

  liff.getProfile()
    .then((profile) => {
      const name = profile.displayName;
      document.getElementById('username').innerText = name;
    })
    .catch((err) => {
      console.log('error', err);
    });

  if (liff.isInClient()) {
    document.getElementById('menu').style.display = 'block';
    document.getElementById('openWindowButton').style.display = 'inline-block';
    document.getElementById('liffLogoutButton').style.display = 'none';
  } else {
    if (liff.isLoggedIn()) {
      document.getElementById('menu').style.display = 'block';
      document.getElementById('login').style.display = 'none';
    } else {
      document.getElementById('menu').style.display = 'none';
      document.getElementById('login').style.display = 'block';
    }

    document.getElementById('openWindowButton').style.display = 'inline-block';
  }
}

function registerButtonHandlers() {
  document.getElementById('openWindowButton').addEventListener('click', function() {
    liff.openWindow({
      url: 'https://foodsy-endserver.herokuapp.com/',
      external: true
    });
  });

  document.getElementById('liffLoginButton').addEventListener('click', function() {
    if (!liff.isLoggedIn()) {
      liff.login();
    }
  });

  document.getElementById('liffLogoutButton').addEventListener('click', function() {
    if (liff.isLoggedIn()) {
      liff.logout();
      window.location.reload();
    }
  });
}
