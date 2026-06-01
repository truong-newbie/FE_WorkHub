import { useCallback, useEffect, useRef, useState } from 'react';
import {
    FaArrowLeft,
    FaComments,
    FaHistory,
    FaPaperPlane,
    FaPlus,
    FaRobot,
    FaSyncAlt,
    FaTimes,
    FaTrashAlt,
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { getItems, formatDate } from '../../shared/moduleUtils.js';
import { getChatbotRoute } from '../chatbotRoutes.js';
import {
    deleteChatConversation,
    getChatConversations,
    getChatMessages,
    sendChatMessage,
} from '../services/chatbotService.js';
import ChatMessage from './ChatMessage.jsx';
import styles from './CandidateChatbot.module.css';

const MAX_MESSAGE_LENGTH = 1000;

function getChatErrorMessage(error) {
    if (error?.status === 429) {
        return 'You are sending messages too quickly. Please wait a moment and try again.';
    }

    if (error?.status >= 500) {
        return 'The assistant is temporarily unavailable. Please try again shortly.';
    }

    return error?.message || 'Unable to complete the request.';
}

export default function CandidateChatbotWidget() {
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false);
    const [isHistoryOpen, setIsHistoryOpen] = useState(false);
    const [isHidden, setIsHidden] = useState(false);
    const [conversations, setConversations] = useState([]);
    const [conversationId, setConversationId] = useState(null);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [isLoadingConversations, setIsLoadingConversations] = useState(false);
    const [isLoadingMessages, setIsLoadingMessages] = useState(false);
    const [isSending, setIsSending] = useState(false);
    const [deletingConversationId, setDeletingConversationId] = useState(null);
    const hasLoadedConversations = useRef(false);
    const messagesEndRef = useRef(null);

    const handleError = useCallback((error) => {
        if (error?.status === 403) {
            setIsHidden(true);
            setIsOpen(false);
            return;
        }

        setErrorMessage(getChatErrorMessage(error));
    }, []);

    const loadConversations = useCallback(async () => {
        setIsLoadingConversations(true);
        setErrorMessage('');

        try {
            const response = await getChatConversations({ page: 0, size: 20 });
            setConversations(getItems(response));
            hasLoadedConversations.current = true;
        } catch (error) {
            handleError(error);
        } finally {
            setIsLoadingConversations(false);
        }
    }, [handleError]);

    const loadMessages = useCallback(async (id) => {
        setIsLoadingMessages(true);
        setErrorMessage('');

        try {
            const response = await getChatMessages(id, { page: 0, size: 100 });
            setConversationId(id);
            setMessages(getItems(response));
        } catch (error) {
            if (error?.status === 404) {
                setConversationId(null);
                setMessages([]);
                await loadConversations();
            }
            handleError(error);
        } finally {
            setIsLoadingMessages(false);
        }
    }, [handleError, loadConversations]);

    useEffect(() => {
        if (isOpen && !hasLoadedConversations.current) {
            loadConversations();
        }
    }, [isOpen, loadConversations]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isSending]);

    const handleNewChat = () => {
        setConversationId(null);
        setMessages([]);
        setErrorMessage('');
        setIsHistoryOpen(false);
    };

    const handleSelectConversation = async (id) => {
        setIsHistoryOpen(false);
        await loadMessages(id);
    };

    const handleDeleteConversation = async (event, conversation) => {
        event.stopPropagation();

        if (deletingConversationId !== null) {
            return;
        }

        if (!window.confirm(`Delete conversation "${conversation.title}"?`)) {
            return;
        }

        setDeletingConversationId(conversation.id);
        setErrorMessage('');

        try {
            await deleteChatConversation(conversation.id);
            setConversations((current) => current.filter((item) => item.id !== conversation.id));

            if (conversationId === conversation.id) {
                setConversationId(null);
                setMessages([]);
            }
        } catch (error) {
            if (error?.status === 404) {
                await loadConversations();
            }
            handleError(error);
        } finally {
            setDeletingConversationId(null);
        }
    };

    const handleNavigate = (url) => {
        const route = getChatbotRoute(url);
        if (!route) {
            setErrorMessage('This link is not available.');
            return;
        }

        navigate(route);
        setIsOpen(false);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        const trimmedMessage = input.trim();

        if (!trimmedMessage || isSending) {
            return;
        }

        if (trimmedMessage.length > MAX_MESSAGE_LENGTH) {
            setErrorMessage(`Messages must not exceed ${MAX_MESSAGE_LENGTH} characters.`);
            return;
        }

        const optimisticMessage = {
            id: `user-${Date.now()}`,
            senderType: 'USER',
            content: trimmedMessage,
            createdAt: new Date().toISOString(),
        };

        setInput('');
        setErrorMessage('');
        setMessages((current) => [...current, optimisticMessage]);
        setIsSending(true);

        try {
            const response = await sendChatMessage({
                ...(conversationId && { conversationId }),
                message: trimmedMessage,
            });

            setConversationId(response.conversationId);
            setMessages((current) => [
                ...current,
                {
                    id: `assistant-${Date.now()}`,
                    senderType: 'ASSISTANT',
                    content: response.answer,
                    intent: response.intent,
                    responseMode: response.responseMode,
                    outOfScope: response.outOfScope,
                    sources: response.sources || [],
                    suggestedActions: response.suggestedActions || [],
                    createdAt: response.createdAt,
                },
            ]);
            loadConversations();
        } catch (error) {
            setMessages((current) => current.filter((message) => message.id !== optimisticMessage.id));
            setInput(trimmedMessage);
            handleError(error);
        } finally {
            setIsSending(false);
        }
    };

    if (isHidden) {
        return null;
    }

    return (
        <div className={styles.widget}>
            {isOpen && (
                <section aria-label="Candidate assistant" className={styles.panel}>
                    <header className={styles.panelHeader}>
                        <div className={styles.assistantIdentity}>
                            <span className={styles.assistantIcon}><FaRobot aria-hidden="true"/></span>
                            <span>
                                <strong>WorkHub Assistant</strong>
                                <small>Candidate support</small>
                            </span>
                        </div>
                        <button
                            aria-label="Close candidate assistant"
                            className={styles.iconButton}
                            onClick={() => setIsOpen(false)}
                            type="button"
                        >
                            <FaTimes aria-hidden="true"/>
                        </button>
                    </header>

                    {isHistoryOpen ? (
                        <div className={styles.historyView}>
                            <div className={styles.viewToolbar}>
                                <button className={styles.toolbarButton} onClick={() => setIsHistoryOpen(false)} type="button">
                                    <FaArrowLeft aria-hidden="true"/> Back
                                </button>
                                <div className={styles.toolbarActions}>
                                    <button aria-label="Refresh conversations" className={styles.iconButton} onClick={loadConversations} type="button">
                                        <FaSyncAlt aria-hidden="true"/>
                                    </button>
                                    <button className={styles.toolbarButton} onClick={handleNewChat} type="button">
                                        <FaPlus aria-hidden="true"/> New chat
                                    </button>
                                </div>
                            </div>

                            <div className={styles.conversationList}>
                                {isLoadingConversations && <p className={styles.mutedText}>Loading conversations...</p>}
                                {!isLoadingConversations && conversations.length === 0 && (
                                    <p className={styles.mutedText}>No previous conversations yet.</p>
                                )}
                                {!isLoadingConversations && conversations.map((conversation) => (
                                    <div
                                        className={`${styles.conversationItem} ${conversationId === conversation.id ? styles.activeConversation : ''}`}
                                        key={conversation.id}
                                    >
                                        <button
                                            className={styles.conversationSelectButton}
                                            onClick={() => handleSelectConversation(conversation.id)}
                                            type="button"
                                        >
                                            <span>
                                                <strong>{conversation.title}</strong>
                                                <small>{conversation.lastMessagePreview}</small>
                                                <time>{formatDate(conversation.lastMessageAt || conversation.createdAt)}</time>
                                            </span>
                                        </button>
                                        <button
                                            aria-label={`Delete conversation ${conversation.title}`}
                                            className={styles.deleteButton}
                                            disabled={deletingConversationId !== null}
                                            onClick={(event) => handleDeleteConversation(event, conversation)}
                                            type="button"
                                        >
                                            <FaTrashAlt aria-hidden="true"/>
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <>
                            <div className={styles.viewToolbar}>
                                <button className={styles.toolbarButton} onClick={() => setIsHistoryOpen(true)} type="button">
                                    <FaHistory aria-hidden="true"/> History
                                </button>
                                <button className={styles.toolbarButton} onClick={handleNewChat} type="button">
                                    <FaPlus aria-hidden="true"/> New chat
                                </button>
                            </div>

                            <div className={styles.messages}>
                                {isLoadingMessages && <p className={styles.mutedText}>Loading messages...</p>}
                                {!isLoadingMessages && messages.length === 0 && (
                                    <div className={styles.welcome}>
                                        <FaRobot aria-hidden="true"/>
                                        <strong>How can I help with your job search?</strong>
                                        <p>Ask about jobs, recommendations, saved jobs, applications, resumes or companies.</p>
                                    </div>
                                )}
                                {!isLoadingMessages && messages.map((message) => (
                                    <ChatMessage key={message.id} message={message} onNavigate={handleNavigate}/>
                                ))}
                                {isSending && <p className={styles.typing}>WorkHub Assistant is responding...</p>}
                                <div ref={messagesEndRef}/>
                            </div>

                            <form className={styles.composer} onSubmit={handleSubmit}>
                                {errorMessage && <p className={styles.errorMessage}>{errorMessage}</p>}
                                <div className={styles.composerRow}>
                                    <textarea
                                        aria-label="Message WorkHub Assistant"
                                        disabled={isSending}
                                        maxLength={MAX_MESSAGE_LENGTH}
                                        onChange={(event) => setInput(event.target.value)}
                                        onKeyDown={(event) => {
                                            if (event.key === 'Enter' && !event.shiftKey) {
                                                event.preventDefault();
                                                event.currentTarget.form?.requestSubmit();
                                            }
                                        }}
                                        placeholder="Ask about your job search..."
                                        rows="2"
                                        value={input}
                                    />
                                    <button
                                        aria-label="Send message"
                                        className={styles.sendButton}
                                        disabled={isSending || !input.trim()}
                                        type="submit"
                                    >
                                        <FaPaperPlane aria-hidden="true"/>
                                    </button>
                                </div>
                                <small className={styles.characterCount}>{input.length}/{MAX_MESSAGE_LENGTH}</small>
                            </form>
                        </>
                    )}

                    {isHistoryOpen && errorMessage && <p className={styles.historyError}>{errorMessage}</p>}
                </section>
            )}

            <button
                aria-label={isOpen ? 'Close candidate assistant' : 'Open candidate assistant'}
                className={styles.launcher}
                onClick={() => setIsOpen((current) => !current)}
                type="button"
            >
                {isOpen ? <FaTimes aria-hidden="true"/> : <FaComments aria-hidden="true"/>}
            </button>
        </div>
    );
}
