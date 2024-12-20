import React, { useState, useEffect } from 'react';
import axios from 'axios';


interface Book {
  title: string;
  authors: string[];
  publisher: string;
  description: string;
  imageUrl: string;
  category: string;
}

const BooksList: React.FC = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [categories] = useState<string[]>([
    'Fiction', 'Non-fiction', 'Science', 'History', 'Mystery', 'Fantasy'
  ]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [startIndex, setStartIndex] = useState<number>(0);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);

  const fetchBooks = async (category: string = '', index: number = 0) => {
    setLoading(true);
    try {
      const categoryQuery = category ? `+subject:${category}` : '';
      const response = await axios.get(
        `https://www.googleapis.com/books/v1/volumes?q=subject:${categoryQuery}&startIndex=${index}&maxResults=9`
      );
      if (!response.data.items) {
        alert("No books found for this category.");
        setLoading(false);
        return;
      }
      const booksData = response.data.items.map((item: any) => ({
        title: item.volumeInfo.title,
        authors: item.volumeInfo.authors || ['Unknown'],
        publisher: item.volumeInfo.publisher || 'Unknown',
        description: item.volumeInfo.description || 'No description available',
        imageUrl: item.volumeInfo.imageLinks?.thumbnail || '',
        category: item.volumeInfo.categories?.[0] || 'Uncategorized',
      }));
      setBooks(prevBooks => [...prevBooks, ...booksData]); // Append new books to existing list
    } catch (error) {
      console.error('Error fetching books', error);
      alert('Something went wrong. Please try again later.');
    }
    setLoading(false);
  };
  // Fetch books when component is mounted or category changes
  useEffect(() => {
    setStartIndex(0); // Reset to first set of books
    setBooks([]); // Clear the list of books
    fetchBooks(selectedCategory, 0); // Fetch first set of books for the selected category
  }, [selectedCategory]);
  // Function to save books to local storage
  const saveToLocalStorage = (book: Book, list: 'wishlist' | 'readlist') => {
    const storedBooks = JSON.parse(localStorage.getItem(list) || '[]');
    storedBooks.push(book);
    localStorage.setItem(list, JSON.stringify(storedBooks));
    alert(`${book.title} has been added to your ${list}.`);
  };
  // Load more books
  const loadMoreBooks = () => {
    setStartIndex(prevStartIndex => prevStartIndex + 10); // Increment startIndex by 10
    fetchBooks(selectedCategory, startIndex + 10); // Fetch next set of books based on updated startIndex
  };
  // Toggle description visibility for the selected book
  const toggleDescription = (book: Book) => {
    // If the clicked book is already selected, hide its description
    if (selectedBook?.title === book.title) {
      setSelectedBook(null);
    } else {
      setSelectedBook(book); // Show the clicked book's description
    }
  };
  return (
    <div >
      {/* Genre filter */}
      <div className='label'>
        <label >Choose a genre to display random books: </label>
        <select className='options'
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
        >
          <option value="" >All Genres</option>
          {categories.map((category, index) => (
            <option key={index} value={category}>
              {category}
            </option>
          ))}
        </select>
      </div>
      {/* Loading spinner */}
      {loading && <p>Loading...</p>}
      {/* Book list */}
      {books.length === 0 ? (
        <p>No books available. Please try again later.</p>
      ) : (

          <ul className='books-container'>
            
            {books.map((book, index) => (
              <li className=' book-card random-card' key={index}>
                <div className='book-item'>
                  <img 
                  src={book.imageUrl} 
                  alt={book.title} style={{ height: "200px", objectFit: "none" }} width={80} 
                  />
                <div className='book-info'>
                  <h2 >{book.title}
                  </h2>
                  <p><strong>Authors:</strong> {book.authors.join(', ')}</p>
                  <p><strong>Publisher:</strong> {book.publisher}</p>
                  <p><strong>Category:</strong> {book.category}</p>
                </div>

                {/* Toggle Description */}


                {/* Show the description if the book is selected */}
                {selectedBook?.title === book.title && (
                  <p><strong>Description:</strong> {book.description}</p>
                )}
                <div className='book-actions'>
                  <button className='book-action' onClick={() => toggleDescription(book)}>
                    {selectedBook?.title === book.title ? 'Hide Description' : 'Show Description'}
                  </button>
                  <button className='book-action' onClick={() => saveToLocalStorage(book, 'wishlist')}>Add to Wishlist</button>
                  <button className='book-action' onClick={() => saveToLocalStorage(book, 'readlist')}>Add to Readlist</button>
                </div>
                {/* Buttons to save to wishlist and readlist */}

              </div>
            </li>
          ))}
        </ul>
      )}
      {/* Load more button */}
      <div className='load'>
        {!loading && books.length > 0 && (
          <button className='loadmore' onClick={loadMoreBooks}>Load More Books</button>
        )}
      </div>
    </div>
  )
};

export default BooksList;