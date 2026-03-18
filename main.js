
// Array untuk menampung semua data buku
const books = [];
const RENDER_EVENT = 'render-book';
const SAVED_EVENT = 'saved-book';
const STORAGE_KEY = 'BOOKSHELF_APPS';

let editingBookId = null;

function generateId() {
  return +new Date();
}

function generateBookObject(id, title, author, year, isComplete) {
  return { id, title, author, year: Number(year), isComplete };
}

function isStorageExist() {
  if (typeof (Storage) === 'undefined') {
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

function makeBookElement(bookObject) {
  const { id, title, author, year, isComplete } = bookObject;

  const textTitle = document.createElement('h3');
  textTitle.innerText = title;
  textTitle.setAttribute('data-testid', 'bookItemTitle');

  const textAuthor = document.createElement('p');
  textAuthor.innerText = `Penulis: ${author}`;
  textAuthor.setAttribute('data-testid', 'bookItemAuthor');

  const textYear = document.createElement('p');
  textYear.innerText = `Tahun: ${year}`;
  textYear.setAttribute('data-testid', 'bookItemYear');

  const actionContainer = document.createElement('div');

  const toggleButton = document.createElement('button');
  toggleButton.type = 'button'; 
  toggleButton.setAttribute('data-testid', 'bookItemIsCompleteButton');
  toggleButton.innerText = isComplete ? 'Belum selesai dibaca' : 'Selesai dibaca';
  toggleButton.addEventListener('click', function () {
    if (isComplete) {
      undoBookFromCompleted(id);
    } else {
      addBookToCompleted(id);
    }
  });

  const deleteButton = document.createElement('button');
  deleteButton.type = 'button';
  deleteButton.setAttribute('data-testid', 'bookItemDeleteButton');
  deleteButton.innerText = 'Hapus Buku';
  deleteButton.addEventListener('click', function () {
    removeBook(id);
  });

  const editButton = document.createElement('button');
  editButton.type = 'button';
  editButton.setAttribute('data-testid', 'bookItemEditButton');
  editButton.innerText = 'Edit Buku';
  editButton.addEventListener('click', function () {
    openEditModal(id);
  });

  actionContainer.append(toggleButton, deleteButton, editButton);

  const container = document.createElement('div');
  container.setAttribute('data-bookid', id);
  container.setAttribute('data-testid', 'bookItem');
  container.append(textTitle, textAuthor, textYear, actionContainer);

  return container;
}

// Hanya untuk menambah buku baru
function addBook() {
  const title = document.getElementById('bookFormTitle').value;
  const author = document.getElementById('bookFormAuthor').value;
  const year = document.getElementById('bookFormYear').value;
  const isComplete = document.getElementById('bookFormIsComplete').checked;

  const generatedID = generateId();
  const bookObject = generateBookObject(generatedID, title, author, year, isComplete);
  books.push(bookObject);

  document.getElementById('bookForm').reset();
  
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function addBookToCompleted(bookId) {
  const bookTarget = findBook(bookId);
  if (bookTarget == null) return;
  bookTarget.isComplete = true;
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function undoBookFromCompleted(bookId) {
  const bookTarget = findBook(bookId);
  if (bookTarget == null) return;
  bookTarget.isComplete = false;
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function removeBook(bookId) {
  const bookTargetIndex = findBookIndex(bookId);
  if (bookTargetIndex === -1) return;
  
  if(confirm("Apakah Anda yakin ingin menghapus buku ini?")) {
    books.splice(bookTargetIndex, 1);
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
  }
}

// MEMBUKA MODAL DAN MENGISI DATA
function openEditModal(bookId) {
  const bookTarget = findBook(bookId);
  if (bookTarget == null) return;

  document.getElementById('editBookTitle').value = bookTarget.title;
  document.getElementById('editBookAuthor').value = bookTarget.author;
  document.getElementById('editBookYear').value = bookTarget.year;
  document.getElementById('editBookIsComplete').checked = bookTarget.isComplete;

  editingBookId = bookTarget.id;
  
  const modal = document.getElementById('editModal');
  modal.style.display = 'flex'; // Tampilkan modal
}

// MENYIMPAN DATA DARI MODAL
function saveEditedBook() {
  const title = document.getElementById('editBookTitle').value;
  const author = document.getElementById('editBookAuthor').value;
  const year = document.getElementById('editBookYear').value;
  const isComplete = document.getElementById('editBookIsComplete').checked;

  const book = findBook(editingBookId);
  if (book) {
    book.title = title;
    book.author = author;
    book.year = Number(year);
    book.isComplete = isComplete;
  }
  
  editingBookId = null;
  document.getElementById('editModal').style.display = 'none'; // Sembunyikan modal
  
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

// -------------------------------------------------------------------------------- //
// EVENT LISTENERS DOM
// -------------------------------------------------------------------------------- //

document.addEventListener('DOMContentLoaded', function () {
  
  const submitForm = document.getElementById('bookForm');
  submitForm.addEventListener('submit', function (event) {
    event.preventDefault();
    addBook();
  });

  const checkboxComplete = document.getElementById('bookFormIsComplete');
  checkboxComplete.addEventListener('change', function () {
    const spanSubmit = document.querySelector('#bookFormSubmit span');
    if (spanSubmit) {
      spanSubmit.innerText = this.checked ? 'Selesai dibaca' : 'Belum selesai dibaca';
    }
  });

  const searchForm = document.getElementById('searchBook');
  searchForm.addEventListener('submit', function (event) {
    event.preventDefault();
    document.dispatchEvent(new Event(RENDER_EVENT));
  });

  // KONTROL MODAL
  const modal = document.getElementById('editModal');
  const closeModalBtn = document.getElementById('closeModal');
  const editForm = document.getElementById('editBookForm');

  closeModalBtn.addEventListener('click', function () {
    modal.style.display = 'none';
    editingBookId = null;
  });

  window.addEventListener('click', function (event) {
    if (event.target === modal) {
      modal.style.display = 'none';
      editingBookId = null;
    }
  });

  editForm.addEventListener('submit', function (event) {
    event.preventDefault();
    saveEditedBook();
  });

  if (isStorageExist()) {
    loadDataFromStorage();
  }
  
  document.dispatchEvent(new Event(RENDER_EVENT));
});

document.addEventListener(RENDER_EVENT, function () {
  const incompleteBookList = document.getElementById('incompleteBookList');
  const completeBookList = document.getElementById('completeBookList');

  incompleteBookList.innerHTML = '';
  completeBookList.innerHTML = '';

  const searchTitle = document.getElementById('searchBookTitle').value.toLowerCase();

  // Variabel untuk menghitung ada berapa buku yang ditampilkan
  let incompleteCount = 0;
  let completeCount = 0;

  for (const bookItem of books) {
    if (searchTitle === '' || bookItem.title.toLowerCase().includes(searchTitle)) {
      const bookElement = makeBookElement(bookItem);
      
      if (bookItem.isComplete) {
        completeBookList.append(bookElement);
        completeCount++;
      } else {
        incompleteBookList.append(bookElement);
        incompleteCount++;
      }
    }
  }

  // JIKA RAK KOSONG, TAMPILKAN PLACEHOLDER
  if (incompleteCount === 0) {
    const emptyMessage = document.createElement('p');
    emptyMessage.innerText = 'Belum ada buku';
    emptyMessage.classList.add('empty-message');
    incompleteBookList.append(emptyMessage);
  }

  if (completeCount === 0) {
    const emptyMessage = document.createElement('p');
    emptyMessage.innerText = 'Belum ada buku';
    emptyMessage.classList.add('empty-message');
    completeBookList.append(emptyMessage);
  }
});
