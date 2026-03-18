const books = [];
const RENDER_EVENT = 'render-book';
const SAVED_EVENT = 'saved-book';
const STORAGE_KEY = 'BOOKSHELF_APPS';

// Variabel tambahan untuk fitur Opsional
let editingBookId = null;
let searchQuery = '';

// --- EVENT LISTENER UTAMA ---
document.addEventListener('DOMContentLoaded', function () {
  const submitForm = document.getElementById('bookForm');
  submitForm.addEventListener('submit', function (event) {
    event.preventDefault();
    if (editingBookId) {
      updateBook(editingBookId); // Mode Edit
    } else {
      addBook(); // Mode Tambah Baru
    }
  });

  const searchForm = document.getElementById('searchBook');
  searchForm.addEventListener('submit', function (event) {
    event.preventDefault();
    searchQuery = document.getElementById('searchBookTitle').value.toLowerCase();
    document.dispatchEvent(new Event(RENDER_EVENT));
  });

  // Interaksi tombol checkbox untuk mengubah teks tombol submit (UX tambahan)
  document.getElementById('bookFormIsComplete').addEventListener('change', function () {
    if (!editingBookId) {
      const isComplete = this.checked;
      const buttonSpan = document.querySelector('#bookFormSubmit span');
      if (buttonSpan) {
        buttonSpan.innerText = isComplete ? 'Selesai dibaca' : 'Belum selesai dibaca';
      }
    }
  });

  if (isStorageExist()) {
    loadDataFromStorage();
  }
});

// --- FUNGSI WEB STORAGE ---
function isStorageExist() /* boolean */ {
  if (typeof (Storage) === undefined) {
    alert('Browser kamu tidak mendukung local storage');
    return false;
  }
  return true;
}

function saveData() {
  if (isStorageExist()) {
    const parsed = JSON.stringify(books);
    localStorage.setItem(STORAGE_KEY, parsed);
    document.dispatchEvent(new Event(SAVED_EVENT));
  }
}

function loadDataFromStorage() {
  const serializedData = localStorage.getItem(STORAGE_KEY);
  let data = JSON.parse(serializedData);

  if (data !== null) {
    for (const book of data) {
      books.push(book);
    }
  }
  document.dispatchEvent(new Event(RENDER_EVENT));
}

// --- FUNGSI MANIPULASI DATA ---
function generateId() {
  return +new Date(); // Wajib berupa unik (timestamp)
}

function generateBookObject(id, title, author, year, isComplete) {
  return {
    id,
    title,
    author,
    year: Number(year), // Wajib memastikan year bertipe number
    isComplete
  };
}

function addBook() {
  const title = document.getElementById('bookFormTitle').value;
  const author = document.getElementById('bookFormAuthor').value;
  const year = document.getElementById('bookFormYear').value;
  const isComplete = document.getElementById('bookFormIsComplete').checked;

  const generatedID = generateId();
  const bookObject = generateBookObject(generatedID, title, author, year, isComplete);
  books.push(bookObject);

  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();

  // Reset form setelah sukses submit
  document.getElementById('bookForm').reset();
}

function updateBook(bookId) {
  const bookTarget = findBook(bookId);
  if (bookTarget == null) return;

  bookTarget.title = document.getElementById('bookFormTitle').value;
  bookTarget.author = document.getElementById('bookFormAuthor').value;
  bookTarget.year = Number(document.getElementById('bookFormYear').value);
  bookTarget.isComplete = document.getElementById('bookFormIsComplete').checked;

  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();

  // Kembalikan form ke mode "Tambah Baru"
  document.getElementById('bookForm').reset();
  editingBookId = null;
  const button = document.getElementById('bookFormSubmit');
  button.innerHTML = `Masukkan Buku ke rak <span>Belum selesai dibaca</span>`;
}

function removeBook(bookId) {
  const bookTargetIndex = findBookIndex(bookId);
  if (bookTargetIndex === -1) return;

  // Fitur konfirmasi agar tidak terhapus tidak sengaja
  const isConfirm = confirm('Apakah kamu yakin ingin menghapus buku ini?');
  if (isConfirm) {
    books.splice(bookTargetIndex, 1);
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
  }
}

function addBookToComplete(bookId) {
  const bookTarget = findBook(bookId);
  if (bookTarget == null) return;

  bookTarget.isComplete = true;
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function undoBookFromComplete(bookId) {
  const bookTarget = findBook(bookId);
  if (bookTarget == null) return;

  bookTarget.isComplete = false;
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function editBook(bookId) {
  const bookTarget = findBook(bookId);
  if (bookTarget == null) return;

  // Masukkan data ke form
  document.getElementById('bookFormTitle').value = bookTarget.title;
  document.getElementById('bookFormAuthor').value = bookTarget.author;
  document.getElementById('bookFormYear').value = bookTarget.year;
  document.getElementById('bookFormIsComplete').checked = bookTarget.isComplete;

  // Ubah status variabel global
  editingBookId = bookId;

  // Ubah teks tombol submit
  const button = document.getElementById('bookFormSubmit');
  button.innerHTML = `Simpan Perubahan Buku`;

  // Scroll otomatis ke bagian form
  document.getElementById('bookForm').scrollIntoView({ behavior: 'smooth' });
}

// --- FUNGSI HELPER PENCARIAN ARRAY ---
function findBook(bookId) {
  for (const bookItem of books) {
    if (bookItem.id === bookId) {
      return bookItem;
    }
  }
  return null;
}

function findBookIndex(bookId) {
  for (const index in books) {
    if (books[index].id === bookId) {
      return index;
    }
  }
  return -1;
}

// --- FUNGSI RENDER (DOM MANIPULATION) ---
function makeBookElement(bookObject) {
  const { id, title, author, year, isComplete } = bookObject;

  const container = document.createElement('div');
  container.setAttribute('data-bookid', id);       // Wajib
  container.setAttribute('data-testid', 'bookItem'); // Wajib

  const titleElement = document.createElement('h3');
  titleElement.setAttribute('data-testid', 'bookItemTitle'); // Wajib
  titleElement.innerText = title;

  const authorElement = document.createElement('p');
  authorElement.setAttribute('data-testid', 'bookItemAuthor'); // Wajib
  authorElement.innerText = `Penulis: ${author}`;

  const yearElement = document.createElement('p');
  yearElement.setAttribute('data-testid', 'bookItemYear'); // Wajib
  yearElement.innerText = `Tahun: ${year}`;

  const actionContainer = document.createElement('div');

  const toggleButton = document.createElement('button');
  toggleButton.setAttribute('data-testid', 'bookItemIsCompleteButton'); // Wajib
  toggleButton.innerText = isComplete ? 'Belum selesai dibaca' : 'Selesai dibaca';
  toggleButton.addEventListener('click', function () {
    if (isComplete) {
      undoBookFromComplete(id);
    } else {
      addBookToComplete(id);
    }
  });

  const deleteButton = document.createElement('button');
  deleteButton.setAttribute('data-testid', 'bookItemDeleteButton'); // Wajib
  deleteButton.innerText = 'Hapus Buku';
  deleteButton.addEventListener('click', function () {
    removeBook(id);
  });

  const editButton = document.createElement('button');
  editButton.setAttribute('data-testid', 'bookItemEditButton'); // Wajib (Opsional 2)
  editButton.innerText = 'Edit Buku';
  editButton.addEventListener('click', function () {
    editBook(id);
  });

  actionContainer.append(toggleButton, deleteButton, editButton);
  container.append(titleElement, authorElement, yearElement, actionContainer);

  return container;
}

document.addEventListener(RENDER_EVENT, function () {
  const incompleteBookList = document.getElementById('incompleteBookList');
  const completeBookList = document.getElementById('completeBookList');

  // Bersihkan elemen sebelumnya
  incompleteBookList.innerHTML = '';
  completeBookList.innerHTML = '';

  // Fitur Pencarian: Filter buku berdasarkan searchQuery
  const filteredBooks = books.filter(book => book.title.toLowerCase().includes(searchQuery));

  for (const bookItem of filteredBooks) {
    const bookElement = makeBookElement(bookItem);
    if (bookItem.isComplete) {
      completeBookList.append(bookElement);
    } else {
      incompleteBookList.append(bookElement);
    }
  }
});
