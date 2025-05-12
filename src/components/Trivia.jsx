import React, { useState, useEffect, useReducer } from 'react';
import api from '../utils/api';
import { useError } from '../contexts/ErrorContext';
import { socket } from '../socket';
import '../styles/trivia.css';

const initialFormState = {
  question: '',
  options: ['', '', '', ''],
  correctAnswer: '',
  timestamp: 0,
  category: 'General',
  movie: 'General',
};

const formReducer = (state, action) => {
  switch (action.type) {
    case 'UPDATE_FIELD':
      return { ...state, [action.field]: action.value };
    case 'UPDATE_OPTION':
      const updatedOptions = [...state.options];
      updatedOptions[action.index] = action.value;
      return { ...state, options: updatedOptions };
    case 'RESET':
      return initialFormState;
    default:
      return state;
  }
};

const Trivia = ({ user, standalone = false, allowCreate = true }) => {
  const [triviaList, setTriviaList] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [newTrivia, dispatchNewTrivia] = useReducer(formReducer, initialFormState);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [isLoading, setIsLoading] = useState(false);
  const [answeredTriviaIds, setAnsweredTriviaIds] = useState(new Set());
  const { showError } = useError();

  const categories = ['All', 'General', 'Plot', 'Cast', 'Director', 'Trivia'];

  useEffect(() => {
    if (!socket.connected) {
      socket.connect();
    }

    socket.off('new-trivia-global'); // Remove previous listeners to avoid duplicates
    socket.on('new-trivia-global', (trivia) => {
      setTriviaList((prev) => [...prev, trivia]);
    });

    const fetchTrivia = async () => {
      setIsLoading(true);
      try {
        const response = await api.get('/trivia');
        setTriviaList(response.data);

        if (user) {
          const answeredResponse = await api.get('/trivia/answered', {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
          });
          setAnsweredTriviaIds(new Set(answeredResponse.data.answeredTriviaIds));
        }
      } catch (error) {
        showError('Failed to fetch trivia');
        console.error('Fetch trivia error:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchTrivia();

    return () => {
      socket.off('new-trivia-global');
    };
  }, [showError, user]);

  const validateForm = (formData) => {
    const { question, options, correctAnswer, category, movie } = formData;
    if (!question || options.some((opt) => !opt) || !correctAnswer) {
      return 'All fields are required';
    }
    if (!options.includes(correctAnswer)) {
      return 'Correct answer must be one of the provided options';
    }
    const uniqueOptions = new Set(options);
    if (uniqueOptions.size !== options.length) {
      return 'Options must be unique';
    }
    if (category !== 'General' && !movie) {
      return 'Movie title is required for non-General categories';
    }
    return null;
  };

  const handleCreateTrivia = async (e) => {
    e.preventDefault();
    const error = validateForm(newTrivia);
    if (error) {
      showError(error);
      return;
    }

    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        showError('Please log in to create trivia');
        window.location.href = '/login';
        return;
      }

      const response = await api.post(
        '/trivia',
        {
          ...newTrivia,
          movie: selectedCategory === 'General' ? 'General' : newTrivia.movie,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setTriviaList((prev) => [...prev, response.data]);
      socket.emit('new-trivia-global', response.data);
      dispatchNewTrivia({ type: 'RESET' });
      setShowForm(false);
      // Removed notification
    } catch (error) {
      console.error('Error creating trivia:', error);
      if (error.response?.status === 401) {
        showError('Session expired. Please log in again.');
        localStorage.removeItem('token');
        window.location.href = '/login';
      } else {
        showError(error.response?.data?.error || 'Failed to create trivia');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnswerSubmit = async (triviaId, selectedAnswer) => {
    if (!selectedAnswer) {
      showError('Please select an answer');
      return;
    }

    setIsLoading(true);
    try {
      const endpoint = `/trivia/${triviaId}/answer`;
      const response = await api.post(endpoint, { answer: selectedAnswer });
      // Removed notification

      setTriviaList((prev) =>
        prev.map((t) =>
          t._id === triviaId ? { ...t, points: response.data.points } : t
        )
      );

      setAnsweredTriviaIds((prev) => new Set(prev).add(triviaId));
    } catch (error) {
      showError('Failed to submit answer');
      console.error('Answer submit error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // New state to track selected answers per trivia question
  const [selectedAnswers, setSelectedAnswers] = useState({});

  // Handler for selecting an answer for a specific trivia question
  const handleSelectAnswer = (triviaId, answer) => {
    setSelectedAnswers((prev) => ({ ...prev, [triviaId]: answer }));
  };

  const filteredTrivia = triviaList.filter(
    (trivia) => selectedCategory === 'All' || trivia.category === selectedCategory
  );

  return (
    <div className="trivia-section">
      {/* Removed notification div */}

      {isLoading && <div className="loading">Loading...</div>}

      {!user ? (
        <p>Please log in to create trivia questions.</p>
      ) : (
        allowCreate && (
          <button
            onClick={() => setShowForm(!showForm)}
            className="create-trivia-btn"
            aria-label={showForm ? 'Cancel creating trivia' : 'Create new trivia'}
          >
            {showForm ? 'Cancel' : 'Create Trivia'}
          </button>
        )
      )}

      {standalone && (
        <div className="category-filter">
          <label htmlFor="category-filter">Filter by Category:</label>
          <select
            id="category-filter"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            aria-label="Select trivia category"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
      )}

      {showForm && (
        <form onSubmit={handleCreateTrivia} className="trivia-form">
          {standalone && (
            <>
              <label htmlFor="new-trivia-category">Category:</label>
              <select
                id="new-trivia-category"
                value={newTrivia.category}
                onChange={(e) =>
                  dispatchNewTrivia({
                    type: 'UPDATE_FIELD',
                    field: 'category',
                    value: e.target.value,
                  })
                }
                required
                aria-label="Select trivia category"
              >
                {categories.filter((cat) => cat !== 'All').map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>

              {newTrivia.category !== 'General' && (
                <input
                  type="text"
                  value={newTrivia.movie}
                  onChange={(e) =>
                    dispatchNewTrivia({
                      type: 'UPDATE_FIELD',
                      field: 'movie',
                      value: e.target.value,
                    })
                  }
                  placeholder="Movie Title (required for movie-specific questions)"
                  required
                  aria-label="Movie title"
                />
              )}
            </>
          )}

          <input
            type="text"
            value={newTrivia.question}
            onChange={(e) =>
              dispatchNewTrivia({
                type: 'UPDATE_FIELD',
                field: 'question',
                value: e.target.value,
              })
            }
            placeholder="Enter question"
            required
            aria-label="Trivia question"
          />
          {newTrivia.options.map((option, index) => (
            <input
              key={index}
              type="text"
              value={option}
              onChange={(e) =>
                dispatchNewTrivia({
                  type: 'UPDATE_OPTION',
                  index,
                  value: e.target.value,
                })
              }
              placeholder={`Option ${index + 1}`}
              required
              aria-label={`Option ${index + 1}`}
            />
          ))}
          <input
            type="text"
            value={newTrivia.correctAnswer}
            onChange={(e) =>
              dispatchNewTrivia({
                type: 'UPDATE_FIELD',
                field: 'correctAnswer',
                value: e.target.value,
              })
            }
            placeholder="Correct Answer"
            required
            aria-label="Correct answer"
          />
          {!standalone && (
            <input
              type="number"
              value={newTrivia.timestamp}
              onChange={(e) =>
                dispatchNewTrivia({
                  type: 'UPDATE_FIELD',
                  field: 'timestamp',
                  value: Number(e.target.value),
                })
              }
              placeholder="Movie timestamp (seconds)"
              min="0"
              required
              aria-label="Movie timestamp in seconds"
            />
          )}
          <button type="submit" disabled={isLoading} aria-label="Add trivia">
            Add Trivia
          </button>
        </form>
      )}

      <div className="total-points" aria-label="User total points">
        Total Points: {filteredTrivia.reduce((sum, trivia) => sum + (trivia.points || 0), 0)}
      </div>
      {filteredTrivia.map((trivia) => (
        <div key={trivia._id} className="trivia-item" role="region" aria-labelledby={`trivia-question-${trivia._id}`}>
          <div className="trivia-inline">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleAnswerSubmit(trivia._id, selectedAnswers[trivia._id]);
              }}
            >
              <div className="trivia-content">
                <h3 id={`trivia-question-${trivia._id}`}>{trivia.question}</h3>
                <div className="trivia-options">
                  {trivia.options.map((option, index) => (
                    <label key={index} className="option-label">
                      <input
                        type="radio"
                        name={`answer-${trivia._id}`}
                        value={option}
                        checked={selectedAnswers[trivia._id] === option}
                        onChange={() => handleSelectAnswer(trivia._id, option)}
                        required
                        disabled={answeredTriviaIds.has(trivia._id)}
                        aria-label={`Option ${index + 1}: ${option}`}
                      />
                      {option}
                    </label>
                  ))}
                </div>
              </div>
              <button
                type="submit"
                disabled={isLoading || answeredTriviaIds.has(trivia._id)}
                aria-label="Submit answer"
              >
                Submit Answer
              </button>
            </form>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Trivia;
