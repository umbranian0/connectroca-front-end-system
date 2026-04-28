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
        <div className="chatbot-logo">
          <img
            src="/assets/connectroca_logo.png"
            alt="ConnectTroca chatbot logo"
            className="chatbot-logo-image"
            loading="lazy"
            decoding="async"
          />
        </div>
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
