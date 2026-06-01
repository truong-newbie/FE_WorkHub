import {useEffect, useState} from 'react';
import styles from '../Assessment.module.css';

const createEmptyOptions = () => [
  {content: '', correct: true},
  {content: '', correct: false},
];

function initialValue(question, defaultOrderIndex) {
  return question ? {
    content: question.content || '',
    type: question.type || 'MULTIPLE_CHOICE',
    score: question.score ?? 1,
    orderIndex: question.orderIndex ?? 1,
    options: question.options?.map(({content, correct}) => ({content, correct})) || createEmptyOptions(),
  } : {
    content: '',
    type: 'MULTIPLE_CHOICE',
    score: 1,
    orderIndex: defaultOrderIndex,
    options: createEmptyOptions(),
  };
}

export default function AssessmentQuestionForm({question, defaultOrderIndex = 1, onCancel, onSave, isSaving}) {
  const [form, setForm] = useState(() => initialValue(question, defaultOrderIndex));
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    setForm(initialValue(question, defaultOrderIndex));
    setErrorMessage('');
  }, [defaultOrderIndex, question]);

  const updateOption = (index, field, value) => {
    setForm((current) => ({
      ...current,
      options: current.options.map((option, optionIndex) => optionIndex === index ? {...option, [field]: value} : option),
    }));
  };

  const removeOption = (index) => setForm((current) => ({
    ...current,
    options: current.options.filter((_, optionIndex) => optionIndex !== index),
  }));

  const submit = async (event) => {
    event.preventDefault();
    const options = form.options.map((option) => ({content: option.content.trim(), correct: option.correct}));
    if (!form.content.trim()) return setErrorMessage('Question content is required.');
    if (!Number(form.score) || Number(form.score) <= 0) return setErrorMessage('Score must be greater than zero.');
    if (form.type === 'MULTIPLE_CHOICE' && (options.length < 2 || options.some((option) => !option.content) || !options.some((option) => option.correct))) {
      return setErrorMessage('Multiple choice questions need at least two filled options and one correct option.');
    }
    setErrorMessage('');
    await onSave({
      content: form.content.trim(),
      type: form.type,
      score: Number(form.score),
      orderIndex: Number(form.orderIndex),
      ...(form.type === 'MULTIPLE_CHOICE' ? {options} : {}),
    });
  };

  return <form className={`${styles.panel} ${styles.stack}`} onSubmit={submit}>
    <h2>{question ? 'Edit question' : defaultOrderIndex > 1 ? 'Add another question' : 'Add question'}</h2>
    {errorMessage && <div className={styles.error}>{errorMessage}</div>}
    <div className={styles.grid}>
      <div className={styles.field}><label htmlFor="question-type">Type</label><select id="question-type" value={form.type} onChange={(event) => setForm({...form, type: event.target.value})}><option value="MULTIPLE_CHOICE">Multiple choice</option><option value="ESSAY">Essay</option></select></div>
      <div className={styles.field}><label htmlFor="question-score">Score</label><input id="question-score" type="number" min="0.01" step="0.01" value={form.score} onChange={(event) => setForm({...form, score: event.target.value})}/></div>
      <div className={styles.field}><label htmlFor="question-order">Order</label><input id="question-order" type="number" min="1" value={form.orderIndex} onChange={(event) => setForm({...form, orderIndex: event.target.value})}/></div>
    </div>
    <div className={styles.field}><label htmlFor="question-content">Question</label><textarea id="question-content" value={form.content} onChange={(event) => setForm({...form, content: event.target.value})}/></div>
    {form.type === 'MULTIPLE_CHOICE' && <div className={styles.stack}>
      <span className={styles.label}>Options</span>
      {form.options.map((option, index) => <div className={styles.optionRow} key={index}>
        <input aria-label={`Correct option ${index + 1}`} type="checkbox" checked={option.correct} onChange={(event) => updateOption(index, 'correct', event.target.checked)}/>
        <input className={styles.grow} aria-label={`Option ${index + 1}`} value={option.content} onChange={(event) => updateOption(index, 'content', event.target.value)}/>
        <button className={styles.dangerButton} type="button" onClick={() => removeOption(index)} disabled={form.options.length <= 2}>Remove</button>
      </div>)}
      <button className={styles.secondaryButton} type="button" onClick={() => setForm({...form, options: [...form.options, {content: '', correct: false}]})}>Add option</button>
    </div>}
    <div className={styles.actions}><button className={styles.button} disabled={isSaving}>{isSaving ? 'Saving...' : 'Save question'}</button>{onCancel && <button className={styles.secondaryButton} type="button" onClick={onCancel}>Cancel</button>}</div>
  </form>;
}
