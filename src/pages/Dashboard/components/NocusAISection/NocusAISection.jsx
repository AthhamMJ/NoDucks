import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './NocusAISection.module.css';

export default function NocusAISection() {
  const navigate = useNavigate();
  const [question, setQuestion] = useState('');

  const ask = (e) => {
    e.preventDefault();
    navigate('/ai-coaching', { state: { question } });
  };

  return (
    <div>
      <h2 className={styles.title}>✦ Nocus AI</h2>
      <p className={styles.desc}>Your personal study assistant. Ask anything, get simple answers.</p>

      <form className={styles.inputRow} onSubmit={ask}>
        <input
          type="text"
          placeholder="Ask anything ..."
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
        />
        <button type="submit" aria-label="Send">↑</button>
      </form>

      <div className={styles.actions}>
        <button onClick={() => navigate('/tasks')}>＋ <span>Add Task</span></button>
        <button onClick={() => navigate('/notes')}>✎ <span>Take Notes</span></button>
      </div>
    </div>
  );
}