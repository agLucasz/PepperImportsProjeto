import React, {
  useRef, useEffect, useCallback, useState,
} from 'react';
import '../../Styles/Admin/rich-text-editor.css';

/* ── tipos ───────────────────────────────────────────────────────────────── */
interface Props {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  minHeight?: number;
}

/* ── comandos da toolbar ────────────────────────────────────────────────── */
interface ToolCmd {
  cmd: string;
  arg?: string;
  label?: string;
  title: string;
  icon: string;        // classe CSS que renderiza o ícone
  group: number;
}

const CMDS: ToolCmd[] = [
  // Bloco
  { cmd: 'formatBlock', arg: 'p',  title: 'Texto normal',  icon: 'rte-icon-p',  group: 1, label: 'P'  },
  { cmd: 'formatBlock', arg: 'h2', title: 'Título H2',     icon: 'rte-icon-h2', group: 1, label: 'H2' },
  { cmd: 'formatBlock', arg: 'h3', title: 'Título H3',     icon: 'rte-icon-h3', group: 1, label: 'H3' },
  // Inline
  { cmd: 'bold',              title: 'Negrito (Ctrl+B)',    icon: 'rte-icon-b',  group: 2, label: 'B'  },
  { cmd: 'italic',            title: 'Itálico (Ctrl+I)',    icon: 'rte-icon-i',  group: 2, label: 'I'  },
  { cmd: 'underline',         title: 'Sublinhado (Ctrl+U)', icon: 'rte-icon-u',  group: 2, label: 'U'  },
  { cmd: 'strikeThrough',     title: 'Tachado',             icon: 'rte-icon-s',  group: 2, label: 'S'  },
  // Listas
  { cmd: 'insertUnorderedList', title: 'Lista com marcadores', icon: 'rte-icon-ul', group: 3 },
  { cmd: 'insertOrderedList',   title: 'Lista numerada',       icon: 'rte-icon-ol', group: 3 },
  // Indentação
  { cmd: 'indent',   title: 'Aumentar recuo',  icon: 'rte-icon-indent',   group: 4 },
  { cmd: 'outdent',  title: 'Diminuir recuo',  icon: 'rte-icon-outdent',  group: 4 },
  // Limpar
  { cmd: 'removeFormat', title: 'Remover formatação', icon: 'rte-icon-clear', group: 5 },
];

/* ── helpers ─────────────────────────────────────────────────────────────── */
const isActive = (cmd: ToolCmd): boolean => {
  try {
    if (cmd.cmd === 'formatBlock') {
      const tag = document.queryCommandValue('formatBlock').toLowerCase();
      return tag === (cmd.arg ?? '');
    }
    return document.queryCommandState(cmd.cmd);
  } catch {
    return false;
  }
};

/* ══════════════════════════════════════════════════════════════════════════ */
const RichTextEditor: React.FC<Props> = ({
  value,
  onChange,
  placeholder = 'Descreva o produto…',
  minHeight = 180,
}) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const [, forceUpdate] = useState(0); // para re-render dos botões ativos

  /* ── inicializa / atualiza HTML quando value muda externamente ─── */
  const lastHtml = useRef('');
  useEffect(() => {
    const el = editorRef.current;
    if (!el) return;
    if (value !== lastHtml.current) {
      el.innerHTML = value;
      lastHtml.current = value;
    }
  }, [value]);

  /* ── dispara onChange quando o conteúdo muda ─────────────────── */
  const handleInput = useCallback(() => {
    const html = editorRef.current?.innerHTML ?? '';
    lastHtml.current = html;
    onChange(html === '<br>' ? '' : html);
  }, [onChange]);

  /* ── executa um comando de formatação ─────────────────────────── */
  const exec = useCallback((cmd: ToolCmd, e: React.MouseEvent) => {
    e.preventDefault();
    editorRef.current?.focus();
    // Para formatBlock precisamos envolver em '<tagName>'
    if (cmd.cmd === 'formatBlock') {
      document.execCommand('formatBlock', false, `<${cmd.arg}>`);
    } else {
      document.execCommand(cmd.cmd, false, undefined);
    }
    handleInput();
    forceUpdate(n => n + 1);
  }, [handleInput]);

  /* ── atualiza estado dos botões ao mover cursor ───────────────── */
  const handleSelectionChange = useCallback(() => {
    forceUpdate(n => n + 1);
  }, []);

  useEffect(() => {
    document.addEventListener('selectionchange', handleSelectionChange);
    return () => document.removeEventListener('selectionchange', handleSelectionChange);
  }, [handleSelectionChange]);

  /* ── agrupa os comandos ──────────────────────────────────────── */
  const groups = CMDS.reduce<ToolCmd[][]>((acc, cmd) => {
    const idx = cmd.group - 1;
    if (!acc[idx]) acc[idx] = [];
    acc[idx].push(cmd);
    return acc;
  }, []);

  const isEmpty = !value || value === '' || value === '<br>';

  return (
    <div className="rte-wrap">
      {/* ── Toolbar ── */}
      <div className="rte-toolbar" onMouseDown={e => e.preventDefault()}>
        {groups.filter(g => g?.length).map((group, gi) => (
          <React.Fragment key={gi}>
            {gi > 0 && <span className="rte-sep" />}
            {group.map(cmd => (
              <button
                key={cmd.cmd + (cmd.arg ?? '')}
                type="button"
                title={cmd.title}
                className={`rte-btn${isActive(cmd) ? ' active' : ''}`}
                onMouseDown={e => exec(cmd, e)}
                aria-label={cmd.title}
              >
                <span className={cmd.icon} aria-hidden="true">
                  {cmd.label ?? ''}
                </span>
              </button>
            ))}
          </React.Fragment>
        ))}
      </div>

      {/* ── Área editável ── */}
      <div
        ref={editorRef}
        className={`rte-body${isEmpty ? ' rte-empty' : ''}`}
        contentEditable
        suppressContentEditableWarning
        onInput={handleInput}
        onKeyUp={() => forceUpdate(n => n + 1)}
        onMouseUp={() => forceUpdate(n => n + 1)}
        style={{ minHeight }}
        data-placeholder={placeholder}
        spellCheck
      />
    </div>
  );
};

export default RichTextEditor;
