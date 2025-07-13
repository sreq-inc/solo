import { useRef } from "react";

export const useBracketAutocompletion = () => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    value: string,
    onChange: (value: string) => void
  ) => {
    if (e.key === '{') {
      e.preventDefault();
      const input = inputRef.current;
      if (!input) return;

      const selectionStart = input.selectionStart || 0;
      const selectionEnd = input.selectionEnd || 0;
      
      // Check if we're typing after another {
      const beforeCursor = value.substring(0, selectionStart);
      const afterCursor = value.substring(selectionEnd);
      
      let newValue: string;
      let newCursorPosition: number;
      
      if (beforeCursor.endsWith('{')) {
        // We're typing the second {, so complete with {{}}
        newValue = beforeCursor + '{}' + afterCursor;
        newCursorPosition = selectionStart + 1;
      } else {
        // First {, so complete with {}
        newValue = beforeCursor + '{}' + afterCursor;
        newCursorPosition = selectionStart + 1;
      }
      
      onChange(newValue);
      
      // Set cursor position after state update
      setTimeout(() => {
        if (input) {
          input.setSelectionRange(newCursorPosition, newCursorPosition);
        }
      }, 0);
    }
    
    // Handle backspace to remove matching brackets
    else if (e.key === 'Backspace') {
      const input = inputRef.current;
      if (!input) return;

      const selectionStart = input.selectionStart || 0;
      const selectionEnd = input.selectionEnd || 0;
      
      // Only handle if no text is selected
      if (selectionStart === selectionEnd && selectionStart > 0) {
        const beforeCursor = value.substring(0, selectionStart);
        const afterCursor = value.substring(selectionStart);
        const charBefore = beforeCursor[selectionStart - 1];
        const charAfter = afterCursor[0];
        
        // Check for bracket pairs to remove
        if (
          (charBefore === '{' && charAfter === '}') ||
          (charBefore === '}' && charAfter === '}' && beforeCursor.endsWith('{}'))
        ) {
          e.preventDefault();
          
          let newValue: string;
          let newCursorPosition: number;
          
          if (charBefore === '}' && charAfter === '}' && beforeCursor.endsWith('{}')) {
            // Remove the whole {{}} pattern
            newValue = beforeCursor.slice(0, -2) + afterCursor.slice(1);
            newCursorPosition = selectionStart - 2;
          } else {
            // Remove the {} pair
            newValue = beforeCursor.slice(0, -1) + afterCursor.slice(1);
            newCursorPosition = selectionStart - 1;
          }
          
          onChange(newValue);
          
          setTimeout(() => {
            if (input) {
              input.setSelectionRange(newCursorPosition, newCursorPosition);
            }
          }, 0);
        }
      }
    }
  };

  return {
    inputRef,
    handleKeyDown,
  };
};
