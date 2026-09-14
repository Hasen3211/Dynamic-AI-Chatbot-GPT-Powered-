/* =========================================================
   NEURACHAT — FRONTEND APPLICATION
   ========================================================= */

const chatContainer = document.getElementById("chatContainer");
const messageInput = document.getElementById("messageInput");
const sendButton = document.getElementById("sendButton");
const welcomeScreen = document.getElementById("welcomeScreen");
const chatHistory = document.getElementById("chatHistory");


/* =========================================================
   APPLICATION STATE
   ========================================================= */

let currentConversationId = null;
let conversations = [];
let isSending = false;


/* =========================================================
   SEND MESSAGE
   ========================================================= */

async function sendMessage() {

    const message = messageInput.value.trim();

    if (!message || isSending) {
        return;
    }

    isSending = true;

    if (welcomeScreen) {
        welcomeScreen.style.display = "none";
    }

    addMessage("user", message);

    messageInput.value = "";
    autoResize(messageInput);

    sendButton.disabled = true;

    try {

        const response = await fetch("/api/chat", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                message: message
            })
        });

        const data = await response.json();

        if (!response.ok || !data.success) {

            addMessage(
                "ai",
                data.error || "Something went wrong. Please try again."
            );

            return;
        }

        if (data.conversation_id) {
            currentConversationId = data.conversation_id;
        }

        addMessage(
            "ai",
            data.response,
            data
        );

        await loadChatHistory();

    } catch (error) {

        console.error("Chat error:", error);

        addMessage(
            "ai",
            "Unable to connect to the chatbot server. Please make sure the Flask application is running."
        );

    } finally {

        isSending = false;

        sendButton.disabled = false;

        messageInput.focus();
    }
}


/* =========================================================
   MARKDOWN RENDERER
   ========================================================= */

function renderMarkdown(text) {

    if (text === null || text === undefined) {
        return "";
    }

    let normalizedText = String(text);


    /* =====================================================
       NORMALIZE BASIC CONTENT
       ===================================================== */

    normalizedText = normalizedText
        .replace(/\r\n/g, "\n")
        .replace(/\r/g, "\n")

        // HTML space entities
        .replace(/&#x20;/gi, " ")
        .replace(/&#32;/gi, " ")
        .replace(/&nbsp;/gi, " ")
        .replace(/\u00A0/g, " ")

        // Zero-width characters
        .replace(/[\u200B-\u200D\uFEFF]/g, "")

        // Escaped HTML line breaks
        .replace(/\\?\s*<br\s*\/?>/gi, "\n")

        // Escaped horizontal rules
        .replace(/^[ \t]*\\([-*_])\1{2,}[ \t]*$/gm, "$1$1$1")

        // Escaped markdown pipes
        .replace(/\\\|/g, "|");


    /* =====================================================
       NORMALIZE INDENTATION
       ===================================================== */

    let lines = normalizedText.split("\n");

    let insideFence = false;
    let minimumIndent = Infinity;

    for (const rawLine of lines) {

        const trimmed = rawLine.trim();

        if (trimmed.startsWith("```")) {
            insideFence = !insideFence;
            continue;
        }

        if (insideFence || !trimmed) {
            continue;
        }

        const match = rawLine.match(/^[ \t]+/);

        if (match) {

            const indent =
                match[0]
                    .replace(/\t/g, "    ")
                    .length;

            minimumIndent =
                Math.min(
                    minimumIndent,
                    indent
                );
        }
    }


    if (
        minimumIndent !== Infinity &&
        minimumIndent > 0
    ) {

        let protectedCode = false;

        lines = lines.map(function(line) {

            if (line.trim().startsWith("```")) {

                protectedCode =
                    !protectedCode;

                return line.trim();
            }

            if (protectedCode) {
                return line;
            }

            return line
                .replace(
                    new RegExp(
                        "^[ \\t]{0," +
                        minimumIndent +
                        "}"
                    ),
                    ""
                )
                .trimEnd();

        });
    }


    /* =====================================================
       REMOVE EXCESSIVE EMPTY LINES
       ===================================================== */

    const cleanedLines = [];

    let previousBlank = false;

    for (const line of lines) {

        const blank =
            line.trim() === "";

        if (blank) {

            if (!previousBlank) {
                cleanedLines.push("");
            }

            previousBlank = true;

        } else {

            cleanedLines.push(line);

            previousBlank = false;
        }
    }

    lines = cleanedLines;


    /* =====================================================
       HTML ESCAPE
       ===================================================== */

    function escapeHTML(value) {

        return String(value)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }


    /* =====================================================
       INLINE MARKDOWN
       ===================================================== */

    function formatInline(value) {

        let result =
            escapeHTML(value);


        /* -------------------------------------------------
           Allow line breaks that came from <br>
        ------------------------------------------------- */

        result =
            result.replace(
                /\\?&lt;br\s*\/?&gt;/gi,
                "<br>"
            );


        /* -------------------------------------------------
           Inline code
        ------------------------------------------------- */

        result =
            result.replace(
                /`([^`\n]+)`/g,
                "<code>$1</code>"
            );


        /* -------------------------------------------------
           Bold
        ------------------------------------------------- */

        result =
            result.replace(
                /\*\*(.+?)\*\*/g,
                "<strong>$1</strong>"
            );

        result =
            result.replace(
                /__(.+?)__/g,
                "<strong>$1</strong>"
            );


        /* -------------------------------------------------
           Italic
        ------------------------------------------------- */

        result =
            result.replace(
                /(^|[^\*])\*([^*\n]+)\*(?!\*)/g,
                "$1<em>$2</em>"
            );

        result =
            result.replace(
                /(^|[^_])_([^_\n]+)_(?!_)/g,
                "$1<em>$2</em>"
            );


        /* -------------------------------------------------
           Links
        ------------------------------------------------- */

        result =
            result.replace(
                /(https?:\/\/[^\s<]+)/g,
                '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>'
            );


        return result;
    }


    /* =====================================================
       LIST STATE
       ===================================================== */

    let html = "";

    let inUnorderedList = false;
    let inOrderedList = false;

    let inCodeBlock = false;
    let codeContent = "";

    let paragraphLines = [];


    /* =====================================================
       CLOSE LISTS
       ===================================================== */

    function closeLists() {

        if (inUnorderedList) {

            html += "</ul>";

            inUnorderedList = false;
        }

        if (inOrderedList) {

            html += "</ol>";

            inOrderedList = false;
        }
    }


    /* =====================================================
       FLUSH PARAGRAPH
       ===================================================== */

    function flushParagraph() {

        if (paragraphLines.length === 0) {
            return;
        }

        const paragraphText =
            paragraphLines
                .map(line => line.trim())
                .filter(Boolean)
                .join(" ");


        if (paragraphText) {

            html += `
                <p class="response-paragraph">
                    ${formatInline(paragraphText)}
                </p>
            `;
        }

        paragraphLines = [];
    }


    /* =====================================================
       CLOSE CODE BLOCK
       ===================================================== */

    function closeCodeBlock() {

        html += `
            <pre class="code-block"><code>${escapeHTML(
                codeContent.replace(/\n$/, "")
            )}</code></pre>
        `;

        codeContent = "";
        inCodeBlock = false;
    }


    /* =====================================================
       TABLE HELPERS
       ===================================================== */

    function splitTableRow(line) {

        let value =
            line.trim();


        if (value.startsWith("|")) {
            value = value.slice(1);
        }

        if (value.endsWith("|")) {
            value = value.slice(0, -1);
        }


        return value
            .split("|")
            .map(function(cell) {
                return cell.trim();
            });
    }


    function isTableSeparator(line) {

        const cells =
            splitTableRow(line);


        if (cells.length === 0) {
            return false;
        }


        return cells.every(function(cell) {

            return /^:?-{3,}:?$/.test(
                cell
            );

        });
    }


    function renderTable(startIndex) {

        const header =
            splitTableRow(
                lines[startIndex]
            );


        const rows = [];

        let index =
            startIndex + 2;


        while (index < lines.length) {

            const current =
                lines[index].trim();


            if (
                !current ||
                !current.includes("|")
            ) {
                break;
            }


            // Stop if another markdown structure begins
            if (
                /^#{1,6}\s+/.test(current) ||
                /^[-*+]\s+/.test(current) ||
                /^\d+\.\s+/.test(current) ||
                /^```/.test(current)
            ) {
                break;
            }


            rows.push(
                splitTableRow(current)
            );

            index++;
        }


        html += `
            <div class="response-table-wrap">
                <table class="response-table">

                    <thead>
                        <tr>
                            ${header.map(function(cell) {

                                return `
                                    <th>
                                        ${formatInline(cell)}
                                    </th>
                                `;

                            }).join("")}
                        </tr>
                    </thead>

                    <tbody>

                        ${rows.map(function(row) {

                            return `
                                <tr>

                                    ${header.map(function(_, cellIndex) {

                                        return `
                                            <td>
                                                ${formatInline(
                                                    row[cellIndex] || ""
                                                )}
                                            </td>
                                        `;

                                    }).join("")}

                                </tr>
                            `;

                        }).join("")}

                    </tbody>

                </table>
            </div>
        `;


        return index;
    }


    /* =====================================================
       MAIN PARSING LOOP
       ===================================================== */

    for (
        let i = 0;
        i < lines.length;
        i++
    ) {

        const rawLine =
            lines[i];

        const line =
            rawLine.trimEnd();


        /* =================================================
           CODE BLOCK
        ================================================= */

        if (
            line.trim().startsWith("```")
        ) {

            flushParagraph();


            if (!inCodeBlock) {

                closeLists();

                inCodeBlock = true;

                codeContent = "";

            } else {

                closeCodeBlock();
            }

            continue;
        }


        if (inCodeBlock) {

            codeContent +=
                rawLine + "\n";

            continue;
        }


        /* =================================================
           EMPTY LINE
        ================================================= */

        if (!line.trim()) {

            flushParagraph();

            closeLists();

            continue;
        }


        /* =================================================
           TABLE
        ================================================= */

        if (
            line.includes("|") &&
            i + 1 < lines.length &&
            isTableSeparator(
                lines[i + 1]
            )
        ) {

            flushParagraph();

            closeLists();

            i =
                renderTable(i) - 1;

            continue;
        }


        /* =================================================
           HORIZONTAL RULE
        ================================================= */

        if (
            /^[-*_]{3,}$/.test(
                line.trim()
            )
        ) {

            flushParagraph();

            closeLists();

            html += `
                <hr class="response-divider">
            `;

            continue;
        }


        /* =================================================
           HEADINGS
        ================================================= */

        const headingMatch =
            line.match(
                /^\s*(#{1,6})\s+(.+)$/
            );


        if (headingMatch) {

            flushParagraph();

            closeLists();


            const level =
                headingMatch[1].length;


            const headingText =
                headingMatch[2].trim();


            let tag =
                "h5";

            let className =
                "response-heading response-heading-xs";


            if (level === 1) {

                tag = "h2";

                className =
                    "response-heading response-heading-lg";

            } else if (level === 2) {

                tag = "h3";

                className =
                    "response-heading";

            } else if (level === 3) {

                tag = "h4";

                className =
                    "response-heading response-heading-sm";

            }


            html += `
                <${tag} class="${className}">
                    ${formatInline(headingText)}
                </${tag}>
            `;

            continue;
        }


        /* =================================================
           UNORDERED LIST
        ================================================= */

        const unorderedMatch =
            line.match(
                /^\s*[-*+]\s+(.+)$/
            );


        if (unorderedMatch) {

            flushParagraph();


            if (inOrderedList) {

                html += "</ol>";

                inOrderedList = false;
            }


            if (!inUnorderedList) {

                html += "<ul>";

                inUnorderedList = true;
            }


            html += `
                <li>
                    ${formatInline(
                        unorderedMatch[1].trim()
                    )}
                </li>
            `;

            continue;
        }


        /* =================================================
           ORDERED LIST
        ================================================= */

        const orderedMatch =
            line.match(
                /^\s*\d+\.\s+(.+)$/
            );


        if (orderedMatch) {

            flushParagraph();


            if (inUnorderedList) {

                html += "</ul>";

                inUnorderedList = false;
            }


            if (!inOrderedList) {

                html += "<ol>";

                inOrderedList = true;
            }


            html += `
                <li>
                    ${formatInline(
                        orderedMatch[1].trim()
                    )}
                </li>
            `;

            continue;
        }


        /* =================================================
           BLOCK QUOTE
        ================================================= */

        const quoteMatch =
            line.match(
                /^\s*>\s+(.+)$/
            );


        if (quoteMatch) {

            flushParagraph();

            closeLists();


            html += `
                <blockquote class="response-quote">
                    ${formatInline(
                        quoteMatch[1].trim()
                    )}
                </blockquote>
            `;

            continue;
        }


        /* =================================================
           NORMAL TEXT
        ================================================= */

        closeLists();

        paragraphLines.push(
            line.trim()
        );
    }


    /* =====================================================
       FINISH
       ================================================= */

    flushParagraph();


    if (inCodeBlock) {
        closeCodeBlock();
    }


    closeLists();


    /* =====================================================
       REMOVE EMPTY BLOCKS
    ===================================================== */

    html =
        html
            .replace(
                /<p class="response-paragraph">\s*<\/p>/g,
                ""
            )
            .trim();


    return html;
}


/* =========================================================
   ADD MESSAGE
   ========================================================= */

function addMessage(
    role,
    text,
    metadata = null
) {

    const messageWrapper =
        document.createElement("div");


    messageWrapper.className =
        role === "user"
            ? "message user-message"
            : "message";


    /* =====================================================
       AVATAR
    ===================================================== */

    const avatar =
        document.createElement("div");


    avatar.className =
        role === "user"
            ? "message-avatar user-avatar"
            : "message-avatar ai-avatar";


    avatar.textContent =
        role === "user"
            ? "U"
            : "✦";


    /* =====================================================
       CONTENT
    ===================================================== */

    const content =
        document.createElement("div");


    content.className =
        "message-content";


    /* =====================================================
       NAME
    ===================================================== */

    const name =
        document.createElement("div");


    name.className =
        "message-name";


    name.textContent =
        role === "user"
            ? "You"
            : "NeuraChat";


    /* =====================================================
       MESSAGE TEXT
    ===================================================== */

    const textElement =
        document.createElement("div");


    textElement.className =
        "message-text";


    if (role === "ai") {

        textElement.innerHTML =
            renderMarkdown(text);

    } else {

        textElement.textContent =
            text;
    }


    content.appendChild(name);
    content.appendChild(textElement);


    /* =====================================================
       AI METADATA + ACTIONS
    ===================================================== */

    if (
        role === "ai" &&
        metadata
    ) {

        addMetadata(
            content,
            metadata
        );


        createResponseActions(
            content,
            text,
            messageWrapper
        );
    }


    /* =====================================================
       ASSEMBLE
    ===================================================== */

    messageWrapper.appendChild(
        avatar
    );

    messageWrapper.appendChild(
        content
    );

    chatContainer.appendChild(
        messageWrapper
    );


    scrollToBottom();
}


/* =========================================================
   ADD METADATA
   ========================================================= */

function addMetadata(
    content,
    metadata
) {

    const meta =
        document.createElement("div");


    meta.className =
        "message-meta";


    /* -----------------------------------------------------
       Intent
    ----------------------------------------------------- */

    if (
        metadata.intent &&
        metadata.intent.intent
    ) {

        const intentBadge =
            document.createElement("span");


        intentBadge.className =
            "meta-badge primary";


        intentBadge.textContent =
            "Intent: " +
            formatLabel(
                metadata.intent.intent
            );


        meta.appendChild(
            intentBadge
        );
    }


    /* -----------------------------------------------------
       Sentiment
    ----------------------------------------------------- */

    if (
        metadata.sentiment &&
        metadata.sentiment.sentiment
    ) {

        const sentimentBadge =
            document.createElement("span");


        sentimentBadge.className =
            "meta-badge";


        sentimentBadge.textContent =
            "Sentiment: " +
            metadata.sentiment.sentiment;


        meta.appendChild(
            sentimentBadge
        );
    }


    /* -----------------------------------------------------
       RAG
    ----------------------------------------------------- */

    const ragBadge =
        document.createElement("span");


    ragBadge.className =
        "meta-badge";


    ragBadge.textContent =
        "RAG Enabled";


    meta.appendChild(
        ragBadge
    );


    /* -----------------------------------------------------
       Web Search
    ----------------------------------------------------- */

    if (
        metadata.web_search_used
    ) {

        const webBadge =
            document.createElement("span");


        webBadge.className =
            "meta-badge primary";


        webBadge.textContent =
            "Web Search";


        meta.appendChild(
            webBadge
        );
    }


    /* -----------------------------------------------------
       Entities
    ----------------------------------------------------- */

    if (metadata.entities) {

        const entityCount =
            countEntities(
                metadata.entities
            );


        if (entityCount > 0) {

            const entityBadge =
                document.createElement("span");


            entityBadge.className =
                "meta-badge";


            entityBadge.textContent =
                "Entities: " +
                entityCount;


            meta.appendChild(
                entityBadge
            );
        }
    }


    content.appendChild(
        meta
    );
}


/* =========================================================
   RESPONSE ACTIONS
   ========================================================= */

function createResponseActions(
    content,
    text,
    messageWrapper
) {

    const actions =
        document.createElement("div");


    actions.className =
        "message-actions";


    /* -----------------------------------------------------
       COPY
    ----------------------------------------------------- */

    const copyButton =
        document.createElement("button");


    copyButton.className =
        "message-action-btn";


    copyButton.type =
        "button";


    copyButton.innerHTML =
        "📋 Copy";


    copyButton.title =
        "Copy response";


    copyButton.addEventListener(
        "click",
        async function() {

            await copyText(
                text,
                copyButton
            );

        }
    );


    actions.appendChild(
        copyButton
    );


    /* -----------------------------------------------------
       REGENERATE
    ----------------------------------------------------- */

    const regenerateButton =
        document.createElement("button");


    regenerateButton.className =
        "message-action-btn regenerate-btn";


    regenerateButton.type =
        "button";


    regenerateButton.innerHTML =
        "↻ Regenerate";


    regenerateButton.title =
        "Generate a new response";


    regenerateButton.addEventListener(
        "click",
        function() {

            regenerateResponse(
                messageWrapper,
                regenerateButton
            );

        }
    );


    actions.appendChild(
        regenerateButton
    );


    content.appendChild(
        actions
    );
}


/* =========================================================
   REGENERATE RESPONSE
   ========================================================= */

async function regenerateResponse(
    messageWrapper,
    regenerateButton
) {

    if (isSending) {
        return;
    }


    isSending = true;

    regenerateButton.disabled =
        true;

    regenerateButton.innerHTML =
        "⟳ Regenerating...";

    sendButton.disabled =
        true;


    try {

        const response =
            await fetch(
                "/api/regenerate",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    }
                }
            );


        const data =
            await response.json();


        if (
            !response.ok ||
            !data.success
        ) {

            alert(
                data.error ||
                "Unable to regenerate response."
            );


            regenerateButton.disabled =
                false;


            regenerateButton.innerHTML =
                "↻ Regenerate";


            return;
        }


        if (data.conversation_id) {

            currentConversationId =
                data.conversation_id;
        }


        const newMessage =
            createAIMessageElement(
                data.response,
                data
            );


        messageWrapper.replaceWith(
            newMessage
        );


        await loadChatHistory();

        scrollToBottom();


    } catch (error) {

        console.error(
            "Regenerate error:",
            error
        );


        alert(
            "Unable to regenerate the response. Please try again."
        );


        regenerateButton.disabled =
            false;


        regenerateButton.innerHTML =
            "↻ Regenerate";


    } finally {

        isSending = false;

        sendButton.disabled =
            false;

        messageInput.focus();
    }
}


/* =========================================================
   CREATE AI MESSAGE
   ========================================================= */

function createAIMessageElement(
    text,
    metadata = null
) {

    const messageWrapper =
        document.createElement("div");


    messageWrapper.className =
        "message";


    const avatar =
        document.createElement("div");


    avatar.className =
        "message-avatar ai-avatar";


    avatar.textContent =
        "✦";


    const content =
        document.createElement("div");


    content.className =
        "message-content";


    const name =
        document.createElement("div");


    name.className =
        "message-name";


    name.textContent =
        "NeuraChat";


    const textElement =
        document.createElement("div");


    textElement.className =
        "message-text";


    textElement.innerHTML =
        renderMarkdown(text);


    content.appendChild(name);

    content.appendChild(
        textElement
    );


    if (metadata) {

        addMetadata(
            content,
            metadata
        );
    }


    createResponseActions(
        content,
        text,
        messageWrapper
    );


    messageWrapper.appendChild(
        avatar
    );


    messageWrapper.appendChild(
        content
    );


    return messageWrapper;
}


/* =========================================================
   COPY TEXT
   ========================================================= */

async function copyText(
    text,
    copyButton
) {

    try {

        await navigator.clipboard.writeText(
            text
        );


        copyButton.innerHTML =
            "✓ Copied";


        copyButton.classList.add(
            "copied"
        );


        setTimeout(
            () => {

                copyButton.innerHTML =
                    "📋 Copy";


                copyButton.classList.remove(
                    "copied"
                );

            },
            1800
        );


    } catch (error) {

        console.error(
            "Copy failed:",
            error
        );


        const temporaryText =
            document.createElement(
                "textarea"
            );


        temporaryText.value =
            text;


        document.body.appendChild(
            temporaryText
        );


        temporaryText.select();


        try {

            document.execCommand(
                "copy"
            );


            copyButton.innerHTML =
                "✓ Copied";


            copyButton.classList.add(
                "copied"
            );


            setTimeout(
                () => {

                    copyButton.innerHTML =
                        "📋 Copy";


                    copyButton.classList.remove(
                        "copied"
                    );

                },
                1800
            );


        } catch (fallbackError) {

            console.error(
                "Fallback copy failed:",
                fallbackError
            );
        }


        document.body.removeChild(
            temporaryText
        );
    }
}


/* =========================================================
   FORMAT LABEL
   ========================================================= */

function formatLabel(value) {

    return String(value)
        .replace(
            /_/g,
            " "
        )
        .replace(
            /\b\w/g,
            function(char) {
                return char.toUpperCase();
            }
        );
}


/* =========================================================
   COUNT ENTITIES
   ========================================================= */

function countEntities(
    entities
) {

    let count = 0;


    if (entities.emails) {
        count += entities.emails.length;
    }


    if (entities.urls) {
        count += entities.urls.length;
    }


    if (entities.technologies) {
        count += entities.technologies.length;
    }


    return count;
}


/* =========================================================
   SCROLL
   ========================================================= */

function scrollToBottom() {

    setTimeout(
        function() {

            chatContainer.scrollTo({

                top:
                    chatContainer.scrollHeight,

                behavior:
                    "smooth"
            });

        },
        50
    );
}


/* =========================================================
   SUGGESTION
   ========================================================= */

function useSuggestion(text) {

    messageInput.value =
        text;


    autoResize(
        messageInput
    );


    messageInput.focus();


    sendMessage();
}


/* =========================================================
   NEW CHAT
   ========================================================= */

async function newChat() {

    if (isSending) {
        return;
    }


    try {

        const response =
            await fetch(
                "/api/new-chat",
                {
                    method: "POST"
                }
            );


        const data =
            await response.json();


        if (
            !response.ok ||
            !data.success
        ) {

            console.error(
                "New chat error:",
                data.error
            );


            return;
        }


        currentConversationId =
            data.conversation_id;


        resetChat();


        await loadChatHistory();


    } catch (error) {

        console.error(
            "New chat error:",
            error
        );
    }
}


/* =========================================================
   CLEAR CURRENT CONVERSATION
   ========================================================= */

async function clearConversation() {

    if (isSending) {
        return;
    }


    const confirmed =
        confirm(
            "Clear the current conversation?"
        );


    if (!confirmed) {
        return;
    }


    try {

        const response =
            await fetch(
                "/api/clear",
                {
                    method: "POST"
                }
            );


        const data =
            await response.json();


        if (!data.success) {

            alert(
                data.error ||
                "Unable to clear conversation."
            );


            return;
        }


        currentConversationId =
            null;


        resetChat();


    } catch (error) {

        console.error(
            "Clear error:",
            error
        );
    }
}


/* =========================================================
   RESET CHAT
   ========================================================= */

function resetChat() {

    chatContainer.innerHTML =
        "";


    chatContainer.appendChild(
        createWelcomeScreen()
    );


    messageInput.value =
        "";


    autoResize(
        messageInput
    );


    messageInput.focus();
}


/* =========================================================
   CREATE WELCOME SCREEN
   ========================================================= */

function createWelcomeScreen() {

    const wrapper =
        document.createElement("div");


    wrapper.className =
        "welcome-screen";


    wrapper.innerHTML = `

        <div class="welcome-icon">
            ✦
        </div>

        <h2>
            How can I help you today?
        </h2>

        <p>
            Ask me anything. I can understand context,
            retrieve knowledge, analyze intent and sentiment,
            and provide intelligent responses.
        </p>

        <div class="suggestions">

            <button onclick="useSuggestion(
                'What is RAG and how does it work?'
            )">

                <span>🧠</span>

                <div>
                    <strong>
                        Learn about RAG
                    </strong>

                    <small>
                        Understand retrieval augmented generation
                    </small>
                </div>

            </button>


            <button onclick="useSuggestion(
                'What technologies are used in this chatbot?'
            )">

                <span>⚙️</span>

                <div>
                    <strong>
                        Explore technology
                    </strong>

                    <small>
                        Learn about the chatbot architecture
                    </small>
                </div>

            </button>


            <button onclick="useSuggestion(
                'How does conversation memory work?'
            )">

                <span>💬</span>

                <div>
                    <strong>
                        Conversation memory
                    </strong>

                    <small>
                        Learn how context is maintained
                    </small>
                </div>

            </button>


            <button onclick="useSuggestion(
                'Explain artificial intelligence in simple words'
            )">

                <span>✨</span>

                <div>
                    <strong>
                        Ask anything
                    </strong>

                    <small>
                        Get a simple AI explanation
                    </small>
                </div>

            </button>

        </div>
    `;


    return wrapper;
}


/* =========================================================
   LOAD CHAT HISTORY
   ========================================================= */

async function loadChatHistory() {

    try {

        const response =
            await fetch(
                "/api/history"
            );


        const data =
            await response.json();


        if (
            !response.ok ||
            !data.success
        ) {

            console.error(
                "History error:",
                data.error
            );


            return;
        }


        conversations =
            data.history || [];


        renderChatHistory();


    } catch (error) {

        console.error(
            "Unable to load history:",
            error
        );
    }
}


/* =========================================================
   RENDER CHAT HISTORY
   ========================================================= */

function renderChatHistory() {

    chatHistory.innerHTML =
        "";


    if (
        conversations.length === 0
    ) {

        const empty =
            document.createElement("div");


        empty.className =
            "history-empty";


        empty.textContent =
            "No recent conversations";


        chatHistory.appendChild(
            empty
        );


        return;
    }


    conversations.forEach(
        function(conversation) {

            const item =
                document.createElement("div");


            item.className =
                "history-item";


            if (
                conversation.id ===
                currentConversationId
            ) {

                item.classList.add(
                    "active"
                );
            }


            const icon =
                document.createElement("span");


            icon.className =
                "history-icon";


            icon.textContent =
                "💬";


            const title =
                document.createElement("span");


            title.className =
                "history-title";


            title.textContent =
                conversation.title ||
                "New conversation";


            const deleteButton =
                document.createElement("button");


            deleteButton.className =
                "history-delete";


            deleteButton.innerHTML =
                "×";


            deleteButton.title =
                "Delete conversation";


            deleteButton.type =
                "button";


            deleteButton.addEventListener(
                "click",
                function(event) {

                    event.stopPropagation();


                    deleteConversation(
                        conversation.id
                    );
                }
            );


            item.appendChild(
                icon
            );


            item.appendChild(
                title
            );


            item.appendChild(
                deleteButton
            );


            item.addEventListener(
                "click",
                function() {

                    loadConversation(
                        conversation.id
                    );
                }
            );


            chatHistory.appendChild(
                item
            );
        }
    );
}


/* =========================================================
   LOAD CONVERSATION
   ========================================================= */

async function loadConversation(
    conversationId
) {

    if (isSending) {
        return;
    }


    try {

        const response =
            await fetch(
                `/api/history/${conversationId}`
            );


        const data =
            await response.json();


        if (
            !response.ok ||
            !data.success
        ) {

            alert(
                data.error ||
                "Unable to load conversation."
            );


            return;
        }


        const conversation =
            data.conversation;


        currentConversationId =
            conversation.id;


        chatContainer.innerHTML =
            "";


        const messages =
            conversation.messages || [];


        messages.forEach(
            function(message) {

                addMessage(
                    message.role === "assistant"
                        ? "ai"
                        : "user",
                    message.content
                );

            }
        );


        if (
            messages.length === 0
        ) {

            chatContainer.appendChild(
                createWelcomeScreen()
            );
        }


        renderChatHistory();


        messageInput.focus();


        if (
            window.innerWidth <= 680
        ) {

            document
                .querySelector(".sidebar")
                .classList.remove(
                    "open"
                );
        }


    } catch (error) {

        console.error(
            "Load conversation error:",
            error
        );
    }
}


/* =========================================================
   DELETE CONVERSATION
   ========================================================= */

async function deleteConversation(
    conversationId
) {

    const confirmed =
        confirm(
            "Delete this conversation permanently?"
        );


    if (!confirmed) {
        return;
    }


    try {

        const response =
            await fetch(
                `/api/history/${conversationId}`,
                {
                    method: "DELETE"
                }
            );


        const data =
            await response.json();


        if (
            !response.ok ||
            !data.success
        ) {

            alert(
                data.error ||
                "Unable to delete conversation."
            );


            return;
        }


        if (
            conversationId ===
            currentConversationId
        ) {

            currentConversationId =
                null;


            resetChat();
        }


        await loadChatHistory();


    } catch (error) {

        console.error(
            "Delete conversation error:",
            error
        );
    }
}


/* =========================================================
   ENTER KEY
   ========================================================= */

function handleKeyDown(
    event
) {

    if (
        event.key === "Enter" &&
        !event.shiftKey
    ) {

        event.preventDefault();

        sendMessage();
    }
}


/* =========================================================
   AUTO RESIZE
   ========================================================= */

function autoResize(
    element
) {

    element.style.height =
        "auto";


    element.style.height =
        Math.min(
            element.scrollHeight,
            130
        ) + "px";
}


/* =========================================================
   MOBILE SIDEBAR
   ========================================================= */

function toggleSidebar() {

    const sidebar =
        document.querySelector(
            ".sidebar"
        );


    sidebar.classList.toggle(
        "open"
    );
}


/* =========================================================
   MOBILE SIDEBAR CLOSE
   ========================================================= */

document.addEventListener(
    "click",
    function(event) {

        if (
            window.innerWidth <= 680 &&
            event.target.closest(
                ".history-item"
            )
        ) {

            document
                .querySelector(
                    ".sidebar"
                )
                .classList.remove(
                    "open"
                );
        }

    }
);


/* =========================================================
   INITIALIZE APPLICATION
   ========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    async function() {

        messageInput.focus();

        await loadChatHistory();

    }
);