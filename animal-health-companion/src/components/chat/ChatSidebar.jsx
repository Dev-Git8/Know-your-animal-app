import { Plus, MessageSquare, Trash2, PanelLeftClose, PanelLeft } from "lucide-react";

const ChatSidebar = ({ conversations, activeId, onSelect, onNew, onDelete, isOpen, onToggle }) => {
  return (
    <>
      {/* Toggle button when sidebar is closed */}
      {!isOpen && (
        <button
          onClick={onToggle}
          className="absolute top-3 left-3 z-20 p-2 rounded-lg bg-card/80 border border-border hover:bg-muted transition-colors"
        >
          <PanelLeft className="h-4 w-4 text-muted-foreground" />
        </button>
      )}

      {/* Sidebar */}
      <div
        className={`${
          isOpen ? "w-64" : "w-0"
        } transition-all duration-200 bg-card border-r border-border flex flex-col overflow-hidden flex-shrink-0`}
      >
        {/* Sidebar header */}
        <div className="p-3 flex items-center justify-between border-b border-border">
          <button
            onClick={onNew}
            className="flex-1 flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
          >
            <Plus className="h-4 w-4" />
            New Chat
          </button>
          <button
            onClick={onToggle}
            className="ml-2 p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground"
          >
            <PanelLeftClose className="h-4 w-4" />
          </button>
        </div>

        {/* Conversations list */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {conversations.length === 0 && (
            <p className="text-xs text-muted-foreground text-center py-6">No conversations yet</p>
          )}
          {conversations.map((conv) => (
            <div
              key={conv.id}
              className={`group flex items-center gap-2 px-3 py-2.5 rounded-lg cursor-pointer transition-colors text-sm ${
                conv.id === activeId
                  ? "bg-primary/10 text-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
              onClick={() => onSelect(conv.id)}
            >
              <MessageSquare className="h-4 w-4 flex-shrink-0" />
              <span className="flex-1 truncate">{conv.title}</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(conv.id);
                }}
                className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-destructive/10 hover:text-destructive transition-all"
              >
                <Trash2 className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default ChatSidebar;
