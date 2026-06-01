import {
    FaArrowRight,
    FaBriefcase,
    FaBuilding,
    FaFileAlt,
    FaQuestionCircle,
} from 'react-icons/fa';
import { formatDate } from '../../shared/moduleUtils.js';
import styles from './CandidateChatbot.module.css';

const SOURCE_ICONS = {
    JOB: FaBriefcase,
    COMPANY: FaBuilding,
    APPLICATION: FaFileAlt,
    RESUME: FaFileAlt,
    HELP: FaQuestionCircle,
};

const RESPONSE_MODE_LABELS = {
    AI: 'AI answer',
    FALLBACK: 'Fallback answer',
    REFUSAL: 'Limited answer',
};

export default function ChatMessage({ message, onNavigate }) {
    const isUser = message.senderType === 'USER';
    const sources = message.sources || [];
    const actions = message.suggestedActions || [];
    const responseModeLabel = RESPONSE_MODE_LABELS[message.responseMode];

    return (
        <article className={`${styles.messageRow} ${isUser ? styles.userRow : styles.assistantRow}`}>
            <div className={`${styles.bubble} ${isUser ? styles.userBubble : styles.assistantBubble}`}>
                {!isUser && (
                    <div className={styles.messageHeading}>
                        <strong>WorkHub Assistant</strong>
                        {responseModeLabel && (
                            <span className={`${styles.responseMode} ${styles[`responseMode${message.responseMode}`]}`}>
                                {responseModeLabel}
                            </span>
                        )}
                    </div>
                )}

                <p className={styles.messageContent}>{message.content}</p>

                {sources.length > 0 && (
                    <div className={styles.sources}>
                        <span className={styles.sectionLabel}>Related information</span>
                        {sources.map((source, index) => {
                            const SourceIcon = SOURCE_ICONS[source.type] || FaQuestionCircle;
                            return (
                                <button
                                    className={styles.sourceCard}
                                    key={`${source.type}-${source.id}-${index}`}
                                    onClick={() => onNavigate(source.url)}
                                    type="button"
                                >
                                    <SourceIcon aria-hidden="true"/>
                                    <span>
                                        <strong>{source.title}</strong>
                                        {source.subtitle && <small>{source.subtitle}</small>}
                                    </span>
                                    <FaArrowRight aria-hidden="true"/>
                                </button>
                            );
                        })}
                    </div>
                )}

                {actions.length > 0 && (
                    <div className={styles.actions}>
                        {actions.map((action, index) => (
                            <button
                                className={styles.actionButton}
                                key={`${action.type}-${index}`}
                                onClick={() => onNavigate(action.url)}
                                type="button"
                            >
                                {action.label}
                            </button>
                        ))}
                    </div>
                )}

                <time className={styles.messageTime}>{formatDate(message.createdAt)}</time>
            </div>
        </article>
    );
}
