/* ============================================================
   «Люди великой страны» — клиентская логика страницы
   Ванильный JavaScript (ES6+). Без внешних источников.
   ============================================================ */

'use strict';

/* --- Простая обёртка над querySelector --- */
const $$ = (sel, root = document) => root.querySelector(sel);
const $$all = (sel, root = document) => Array.from(root.querySelectorAll(sel));

/* --- Режим «JS работает»: включает анимации появления --- */
document.documentElement.classList.add('js');

/* ---------- 1. Шапка: тень при прокрутке ---------- */

const header = $$('#header');

const onHeaderScroll = () => {
  if (!header) {return;}
  header.classList.toggle('is-scrolled', window.scrollY > 8);
};

window.addEventListener('scroll', onHeaderScroll, { passive: true });
onHeaderScroll();

/* ---------- 2. Мобильное меню (burger) ---------- */

const burger = $$('#burger');
const nav = $$('#site-nav');

if (burger && nav) {
  const closeMenu = () => {
    $$('.site-header')?.classList.remove('is-open');
    burger.setAttribute('aria-expanded', 'false');
    burger.setAttribute('aria-label', 'Открыть меню');
  };

  const openMenu = () => {
    $$('.site-header')?.classList.add('is-open');
    burger.setAttribute('aria-expanded', 'true');
    burger.setAttribute('aria-label', 'Закрыть меню');
  };

  burger.addEventListener('click', () => {
    const isOpen = burger.getAttribute('aria-expanded') === 'true';
    if (isOpen) {
      closeMenu();
    } else {
      openMenu();
    }
  });

  /* Закрываем меню по клику на пункт навигации */
  $$all('a', nav).forEach((link) => {
    link.addEventListener('click', closeMenu);
  });

  /* Закрываем по Esc */
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {closeMenu();}
  });
}

/* ---------- 3. Подсветка активного раздела в меню ---------- */

const sections = $$all('main section[id]');
const navLinks = $$all('.site-nav__list a');

const highlightNav = (visibleIds) => {
  navLinks.forEach((link) => {
    const target = link.getAttribute('href').slice(1);
    link.classList.toggle('is-active', visibleIds.has(target));
  });
};

if ('IntersectionObserver' in window && sections.length > 0) {
  const visible = new Set();

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          visible.add(entry.target.id);
        } else {
          visible.delete(entry.target.id);
        }
      });

      if (visible.size > 0) {
        /* Активной считаем самую высокую из видимых секций */
        const firstVisible = sections.find((s) => visible.has(s.id));
        if (firstVisible) {highlightNav(new Set([firstVisible.id]));}
      }
    },
    { rootMargin: '-40% 0px -55% 0px' },
  );

  sections.forEach((section) => observer.observe(section));
}

/* ---------- 4. Появление карточек при прокрутке ---------- */

const revealItems = $$all('.reveal');

if ('IntersectionObserver' in window && revealItems.length > 0) {
  const revealObserver = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          obs.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 },
  );

  revealItems.forEach((item) => revealObserver.observe(item));
} else {
  revealItems.forEach((item) => item.classList.add('is-visible'));
}

/* ---------- 5. Викторина ---------- */

const QUIZ_DATA = [
  {
    question: 'Как называется «праздник сохи» у татар и башкир?',
    options: ['Сурхарбан', 'Сабантуй', 'Ысыах', 'Шагаал'],
    correct: 1,
  },
  {
    question: 'Какой праздник отмечают в день весеннего равноденствия?',
    options: ['Сабантуй', 'Масленица', 'Навруз', 'Шагаал'],
    correct: 2,
  },
  {
    question: 'Какого числа отмечают День семьи, любви и верности?',
    options: ['8 июля', '12 апреля', '9 мая', '8 марта'],
    correct: 0,
  },
  {
    question: 'Кто стал первым человеком в космосе?',
    options: ['Герман Титов', 'Юрий Гагарин', 'Алексей Леонов', 'Валентина Терешкова'],
    correct: 1,
  },
  {
    question: 'Какой профессии посвящён мини-раздел страницы?',
    options: ['Только врач', 'Только учитель', 'Только строитель', 'Несколько профессий'],
    correct: 3,
  },
  {
    question: 'Сколько примерно народов живёт в России?',
    options: ['Около 20', 'Около 70', 'Свыше 190', 'Около 400'],
    correct: 2,
  },
];

const quizRoot = $$('#quiz');

const renderQuizCard = (index, score) => {
  const item = QUIZ_DATA[index];
  const card = document.createElement('div');
  card.className = 'quiz__card';

  const progress = document.createElement('p');
  progress.className = 'quiz__progress';
  progress.textContent = `Вопрос ${ index + 1 } из ${ QUIZ_DATA.length }`;
  card.appendChild(progress);

  const question = document.createElement('h3');
  question.className = 'quiz__question';
  question.textContent = item.question;
  card.appendChild(question);

  const options = document.createElement('div');
  options.className = 'quiz__options';
  card.appendChild(options);

  item.options.forEach((option, optionIndex) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'quiz__btn';
    button.textContent = option;

    button.addEventListener('click', () => {
      const isRight = optionIndex === item.correct;
      if (isRight) {score += 1;}

      $$all('.quiz__btn', options).forEach((btn, i) => {
        btn.disabled = true;
        if (i === item.correct) {btn.classList.add('is-right');}
      });

      if (!isRight) {button.classList.add('is-wrong');}

      /* Задержка — чтобы пользователь увидел результат выбора */
      window.setTimeout(() => {
        if (index + 1 < QUIZ_DATA.length) {
          renderQuizCard(index + 1, score);
        } else {
          quizRoot.replaceChildren(renderQuizResult(score));
        }
      }, 800);
    });

    options.appendChild(button);
  });

  quizRoot.replaceChildren(card);
};

const renderQuizResult = (score) => {
  const total = QUIZ_DATA.length;
  const card = document.createElement('div');
  card.className = 'quiz__card';

  const title = document.createElement('h3');
  title.className = 'quiz__result-title';
  title.textContent = `Ваш результат: ${ score } из ${ total }`;
  card.appendChild(title);

  const text = document.createElement('p');
  text.className = 'quiz__result-text';
  text.textContent =
    score === total
      ? 'Отлично! Вы настоящий знаток темы «Люди великой страны».'
      : 'Неплохо! Перечитайте разделы выше и попробуйте ещё раз — тема стоит того.';
  card.appendChild(text);

  const restart = document.createElement('button');
  restart.type = 'button';
  restart.className = 'btn btn--primary';
  restart.textContent = 'Пройти заново';
  restart.addEventListener('click', () => {
    renderQuizCard(0, 0);
  });
  card.appendChild(restart);

  return card;
};

if (quizRoot) {
  const start = () => {
    renderQuizCard(0, 0);
  };
  start();
}
