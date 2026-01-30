'use client'

/**
 * Module Provider
 * Global context for CRM module selection (Sales, Service, etc.)
 *
 * Manages which CRM module is active and provides module-aware navigation.
 * Each module has its own set of features while sharing common entities
 * like Accounts and Contacts.
 */

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { Briefcase, Headphones, type LucideIcon } from 'lucide-react'

// ===== TYPES =====

export type ModuleId = 'sales' | 'service'

export interface ModuleDefinition {
  id: ModuleId
  name: string
  description: string
  icon: LucideIcon
  defaultRoute: string
}

interface ModuleContextValue {
  activeModule: ModuleId
  setActiveModule: (module: ModuleId) => void
  modules: ModuleDefinition[]
  getModule: (id: ModuleId) => ModuleDefinition | undefined
  isLoading: boolean
}

// ===== CONSTANTS =====

const MODULE_STORAGE_KEY = 'crm-active-module'
const DEFAULT_MODULE: ModuleId = 'sales'

/**
 * Available CRM modules
 * Each module represents a distinct business area with its own features
 */
export const CRM_MODULES: ModuleDefinition[] = [
  {
    id: 'sales',
    name: 'Sales',
    description: 'Pipeline, quotes, orders',
    icon: Briefcase,
    defaultRoute: '/dashboard',
  },
  {
    id: 'service',
    name: 'Service',
    description: 'Cases, support tickets',
    icon: Headphones,
    defaultRoute: '/dashboard',
  },
]

// ===== CONTEXT =====

const ModuleContext = createContext<ModuleContextValue | undefined>(undefined)

// ===== STORAGE HELPERS =====

function loadModuleFromStorage(): ModuleId {
  if (typeof window === 'undefined') {
    return DEFAULT_MODULE
  }

  try {
    const stored = localStorage.getItem(MODULE_STORAGE_KEY)
    if (stored && (stored === 'sales' || stored === 'service')) {
      return stored as ModuleId
    }
    return DEFAULT_MODULE
  } catch (error) {
    console.error('Failed to load module from storage', error)
    return DEFAULT_MODULE
  }
}

function saveModuleToStorage(module: ModuleId): void {
  if (typeof window === 'undefined') return

  try {
    localStorage.setItem(MODULE_STORAGE_KEY, module)
  } catch (error) {
    console.error('Failed to save module to storage', error)
  }
}

// ===== PROVIDER COMPONENT =====

export function ModuleProvider({ children }: { children: React.ReactNode }) {
  const [activeModule, setActiveModuleState] = useState<ModuleId>(DEFAULT_MODULE)
  const [isLoading, setIsLoading] = useState(true)
  const [mounted, setMounted] = useState(false)

  // Load module from storage on mount
  useEffect(() => {
    setMounted(true)
    const loaded = loadModuleFromStorage()
    setActiveModuleState(loaded)
    setIsLoading(false)
  }, [])

  // Set active module with persistence
  const setActiveModule = useCallback((module: ModuleId) => {
    setActiveModuleState(module)
    saveModuleToStorage(module)
  }, [])

  // Get module definition by ID
  const getModule = useCallback((id: ModuleId) => {
    return CRM_MODULES.find(m => m.id === id)
  }, [])

  const value: ModuleContextValue = {
    activeModule,
    setActiveModule,
    modules: CRM_MODULES,
    getModule,
    isLoading,
  }

  // Prevent hydration mismatch by not rendering until mounted
  if (!mounted) {
    return null
  }

  return (
    <ModuleContext.Provider value={value}>
      {children}
    </ModuleContext.Provider>
  )
}

// ===== HOOK =====

/**
 * Hook to access module context
 *
 * @example
 * const { activeModule, setActiveModule, modules } = useModule()
 *
 * // Change module
 * setActiveModule('service')
 *
 * // Check current module
 * if (activeModule === 'sales') {
 *   // Sales-specific logic
 * }
 */
export function useModule(): ModuleContextValue {
  const context = useContext(ModuleContext)
  if (!context) {
    throw new Error('useModule must be used within ModuleProvider')
  }
  return context
}
