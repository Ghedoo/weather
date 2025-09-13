// مفتاح API للوصول لبيانات الطقس
const API_KEY = "d238019b8a5c4eee996214720250909";

// مسار أنيميشن الزر الرئيسي
const mainButtonAnimation = "animations/icons.json";

// تعريف أنيميشنات الطقس حسب الحالة الجوية
const animations = {
  sunny: "animations/sunny.json",
  cloud: "animations/cloudy.json",
  rain: "animations/rainy.json",
  moon: "animations/Weather-night.json"
};

// تحميل أنيميشن Navbar
lottie.loadAnimation({
  container: document.getElementById('nav-icon'), // العنصر الذي ستظهر فيه الأنيميشن
  renderer: 'svg',
  loop: true, // تكرار الأنيميشن
  autoplay: true, // التشغيل التلقائي
  path: 'animations/Cloudy2.json' // مسار ملف Lottie
});

// عند تحميل الصفحة، إخفاء الـLoader بعد 1.2 ثانية
window.addEventListener("load", () => {
  setTimeout(() => {
    document.getElementById("loader").classList.add("hide");
  }, 1200);
});

// تحميل أنيميشن الـLoader
lottie.loadAnimation({
  container: document.getElementById('loader-animation'),
  renderer: 'svg',
  loop: true,
  autoplay: true,
  path: 'animations/Cloudy.json'
});

// دالة لتحميل أنيميشن Lottie في أي عنصر حسب الـID
function loadLottie(id, path){
  const container = document.getElementById(id);
  // إذا كانت هناك أنيميشن سابقة، احذفها أولاً
  if(container.lottieInstance) container.lottieInstance.destroy();
  container.lottieInstance = lottie.loadAnimation({ container, renderer:'svg', loop:true, autoplay:true, path });
}

// دالة لتحديد أي أنيميشن يظهر حسب الطقس والساعة
function getAnimation(weather,hour){
  weather = weather.toLowerCase();
  const isNight = hour>=18 || hour<6; // تحديد إذا كانت الليلة
  if(weather.includes("rain")||weather.includes("drizzle")||weather.includes("thunder")) return animations.rain;
  if(weather.includes("cloud")) return animations.cloud;
  if(weather.includes("clear") && isNight) return animations.moon;
  return animations.sunny;
}

// جلب بيانات الطقس وعرضها في الكروت
async function fetchWeather(city){
  try{
    const res = await fetch(`https://api.weatherapi.com/v1/forecast.json?key=${API_KEY}&q=${city}&days=3&aqi=no&alerts=no`);
    const data = await res.json();

    // في حالة وجود خطأ من API
    if(data.error) return alert(data.error.message);

    // تحديث عنوان المدينة
    document.getElementById("title").textContent = `${data.location.name}, ${data.location.country}`;
    // تحديث آخر وقت تحديث البيانات
    document.getElementById("meta").textContent = `Updated: ${data.current.last_updated}`;

    const container = document.getElementById("forecast-cards");
    container.innerHTML = ""; // مسح أي كروت قديمة

    // إنشاء كارت لكل يوم
    data.forecast.forecastday.forEach((day, idx)=>{
      const date = new Date(day.date);
      const weekday = date.toLocaleDateString("en-US",{weekday:"long"});
      const avg = Math.round(day.day.avgtemp_c);
      const max = Math.round(day.day.maxtemp_c);
      const min = Math.round(day.day.mintemp_c);
      const desc = day.day.condition.text;
      const wind = Math.round(day.day.maxwind_kph);
      const humidity = day.day.avghumidity;
      const hour = new Date(day.hour[12].time).getHours(); // الساعة المتوسطة لكل يوم
      const cardId = `card-${idx}`;
      const lottieId = `lottie-${idx}`;
      const animPath = getAnimation(desc,hour); // اختيار الأنيميشن المناسب

      // إضافة الكارت إلى الـHTML
      container.innerHTML += `
        <article class="card" id="${cardId}">
          <div class="visual">
            <div id="${lottieId}" class="lottie-box"></div> <!-- مكان الأنيميشن -->
            <div style="position:absolute; left:16px; bottom:18px; font-weight:600;">${weekday}</div>
          </div>
          <div class="info">
            <div class="temp">${avg}°C</div>
            <div class="desc">${desc}</div>
            <div class="details">
              <div><i class="fa-solid fa-temperature-high"></i> Max: ${max}°C</div>
              <div><i class="fa-solid fa-temperature-low"></i> Min: ${min}°C</div>
              <div><i class="fa-solid fa-droplet"></i> Humidity: ${humidity}%</div>
              <div><i class="fa-solid fa-wind"></i> Wind: ${wind} km/h</div>
            </div>
          </div>
        </article>`;

      // تحميل أنيميشن Lottie لكل كارت
      setTimeout(()=>loadLottie(lottieId,animPath),100);
    });

    // إضافة الحركة لكل كارت عند ظهوره
    document.querySelectorAll('.card').forEach(c=>c.classList.add('animate'));

    // إعداد التابس على الموبايل
    const tabs = document.querySelectorAll('#tabs button');
    const cards = document.querySelectorAll('.card');
    cards.forEach((c,i)=>c.classList.remove('active'));
    if(window.innerWidth <= 768) cards[0].classList.add('active');

    tabs.forEach(btn=>{
      btn.addEventListener('click', ()=>{
        tabs.forEach(b=>b.classList.remove('active'));
        btn.classList.add('active');
        const idx = parseInt(btn.getAttribute('data-index'));
        cards.forEach(c=>c.classList.remove('active'));
        cards[idx].classList.add('active');
      });
    });

  } catch(err){ 
    alert("Failed to fetch weather data"); 
    console.error(err); 
  }
}

// زر البحث
document.getElementById("search-btn").addEventListener("click", ()=>{
  const city = document.getElementById("city-input").value.trim();
  if(city) fetchWeather(city);
});

// البحث بالضغط على Enter
document.getElementById("city-input").addEventListener("keypress", function(e){
  if(e.key === "Enter") document.getElementById("search-btn").click();
});

// FAB Menu
const fab = document.querySelector('.fab'); // الزر العائم
const fabMenu = document.querySelector('.fab-menu'); // قائمة FAB
const fabItems = fabMenu.querySelectorAll('li a'); // عناصر القائمة
let isHovering = false;

// إظهار القائمة عند المرور بالماوس
fab.addEventListener('mouseenter', showMenu);
fabMenu.addEventListener('mouseenter', showMenu);

// إخفاء القائمة عند الخروج من الزر أو القائمة
fab.addEventListener('mouseleave', ()=>{ setTimeout(()=>{ if(!isHovering) hideMenu(); },100); });
fabMenu.addEventListener('mouseleave', ()=>{ isHovering=false; setTimeout(()=>{ if(!isHovering) hideMenu(); },100); });

function showMenu(){
  fabMenu.style.pointerEvents='auto'; // السماح بالتفاعل
  isHovering = true;
  // إظهار كل عنصر تدريجياً
  fabItems.forEach((item,index)=>{
    setTimeout(()=>{ item.style.transform='translateY(0)'; item.style.opacity='1'; }, index*100);
  });
}

function hideMenu(){
  // إخفاء كل عنصر تدريجياً
  fabItems.forEach((item,index)=>{
    setTimeout(()=>{ item.style.transform='translateY(20px)'; item.style.opacity='0'; }, index*50);
  });
  setTimeout(()=>{ fabMenu.style.pointerEvents='none'; }, fabItems.length*50);
}

// Hamburger Menu (للموبايل)
const hamburger = document.getElementById('hamburger');
const navLinks = document.getElementById('nav-links');

// فتح/إغلاق القايمة عند الضغط
hamburger.addEventListener('click', () => {
  navLinks.classList.toggle('active');
  hamburger.classList.toggle('open');
});

// إغلاق القايمة عند الضغط خارجها
document.addEventListener('click', (e) => {
  if(navLinks.classList.contains('active') && !navLinks.contains(e.target) && !hamburger.contains(e.target)){
    navLinks.classList.remove('active');
    hamburger.classList.remove('open');
  }
});

// التحميل الابتدائي
fetchWeather("London"); // جلب الطقس الافتراضي عند فتح الصفحة
loadLottie("main-icon", mainButtonAnimation); // تحميل أيقونة رئيسية
