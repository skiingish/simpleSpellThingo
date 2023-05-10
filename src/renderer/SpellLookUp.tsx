import React, { useState, useEffect, useRef } from 'react';

export default function SpellLookUp() {
  const inputRef = useRef(null);

  const [lookupText, setlookUpText] = useState<string>('');
  const [suggestion, setSuggestion] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (lookupText === null || lookupText === '') return;

    setLoading(true);
    try {
      const res = await window.electron.ipcRenderer.invoke(
        'HTTP:CHECK_SPELLING',
        lookupText
      );
      setSuggestion(res.data);
      navigator.clipboard.writeText(res.data);
      setlookUpText('');
      setLoading(false);

      if (res.status === 200) {
        window.electron.ipcRenderer.sendMessage('DB:ADDUPDATEWORD', res.data);
      }
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(() => {
    inputRef.current.focus();
  }, []);

  return (
    <div className="spellCheckFormContainer">
      {loading ? (
        <p>Checking...</p>
      ) : (
        <>
          <form className="spellCheckForm" onSubmit={handleSubmit}>
            <input
              className="spellCheckInput"
              id="input-field"
              ref={inputRef}
              type="text"
              placeholder="Enter text"
              value={lookupText}
              onChange={(e) => setlookUpText(e.target.value)}
            />
            <button type="submit">Submit</button>
          </form>
          <br />
          <div>{suggestion}</div>{' '}
        </>
      )}
    </div>
  );
}
