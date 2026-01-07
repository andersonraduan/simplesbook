'use client'

import { useState, useRef, useEffect } from 'react'
import { Input } from './input'
import { Button } from './button'

export interface ComboboxOption {
  value: string
  label: string
}

interface ComboboxProps {
  options: ComboboxOption[]
  value?: string | string[]
  onChange: (value: string | string[]) => void
  placeholder?: string
  multiple?: boolean
  disabled?: boolean
  emptyMessage?: string
}

export function Combobox({
  options,
  value,
  onChange,
  placeholder = 'Buscar...',
  multiple = false,
  disabled = false,
  emptyMessage = 'Nenhuma opção encontrada',
}: ComboboxProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const selectedValues = multiple
    ? Array.isArray(value)
      ? value
      : []
    : value
    ? [value as string]
    : []

  const filteredOptions = options.filter((option) =>
    option.label.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const selectedOptions = options.filter((opt) =>
    selectedValues.includes(opt.value)
  )

  const handleSelect = (optionValue: string) => {
    if (multiple) {
      const currentValues = Array.isArray(value) ? value : []
      if (currentValues.includes(optionValue)) {
        onChange(currentValues.filter((v) => v !== optionValue))
      } else {
        onChange([...currentValues, optionValue])
      }
    } else {
      onChange(optionValue)
      setIsOpen(false)
      setSearchTerm('')
    }
  }

  const handleRemove = (optionValue: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (multiple) {
      const currentValues = Array.isArray(value) ? value : []
      onChange(currentValues.filter((v) => v !== optionValue))
    } else {
      onChange('')
    }
  }

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
        setSearchTerm('')
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div ref={containerRef} className="relative">
      <div
        className="flex flex-wrap gap-2 p-2 border rounded-md bg-background min-h-[42px] cursor-text"
        onClick={() => !disabled && setIsOpen(true)}
      >
        {selectedOptions.map((opt) => (
          <span
            key={opt.value}
            className="inline-flex items-center gap-1 px-2 py-1 text-sm bg-gray-100 rounded"
          >
            {opt.label}
            {!disabled && (
              <button
                onClick={(e) => handleRemove(opt.value, e)}
                className="text-gray-500 hover:text-gray-700"
                type="button"
              >
                ×
              </button>
            )}
          </span>
        ))}
        {isOpen && (
          <Input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={placeholder}
            className="flex-1 min-w-[120px] border-0 focus:ring-0 p-0 h-auto"
            autoFocus
            disabled={disabled}
          />
        )}
        {!isOpen && selectedOptions.length === 0 && (
          <span className="text-gray-400 text-sm self-center">
            {placeholder}
          </span>
        )}
      </div>

      {isOpen && !disabled && (
        <div className="absolute z-50 w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-auto">
          {filteredOptions.length === 0 ? (
            <div className="p-3 text-sm text-gray-500 text-center">
              {emptyMessage}
            </div>
          ) : (
            <ul className="py-1">
              {filteredOptions.map((option) => {
                const isSelected = selectedValues.includes(option.value)
                return (
                  <li
                    key={option.value}
                    onClick={() => handleSelect(option.value)}
                    className={`px-3 py-2 cursor-pointer hover:bg-gray-100 ${
                      isSelected ? 'bg-blue-50 text-blue-700' : ''
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {multiple && (
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => {}}
                          className="cursor-pointer"
                        />
                      )}
                      <span className="text-sm">{option.label}</span>
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}

