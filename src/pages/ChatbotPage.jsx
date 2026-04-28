function ChatbotPage() {
  return (
    <section className="page-section chatbot-page">
      <header className="chatbot-hero">
        <h1>
          Welcome
          <br />
          to
          <br />
          Chat Bot!
        </h1>
        <div className="chatbot-logo">?</div>
      </header>

      <footer className="chat-input-wrap">
        <input type="text" placeholder="Pergunte qualquer coisa" disabled />
        <button type="button" className="button button-primary" disabled>
          ?
        </button>
      </footer>
    </section>
  );
}

export default ChatbotPage;
