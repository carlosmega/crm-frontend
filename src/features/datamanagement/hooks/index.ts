'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { datamanagementService } from '../api/datamanagement-service'
import type {
  CreateImportJobDto,
  CreateExportJobDto,
} from '@/core/contracts'

/**
 * Query key factory for data management
 */
export const dataManagementKeys = {
  all: ['datamanagement'] as const,
  imports: () => [...dataManagementKeys.all, 'imports'] as const,
  import: (id: string) => [...dataManagementKeys.imports(), id] as const,
  exports: () => [...dataManagementKeys.all, 'exports'] as const,
  export: (id: string) => [...dataManagementKeys.exports(), id] as const,
}

/**
 * List all import jobs
 */
export function useImportJobs() {
  return useQuery({
    queryKey: dataManagementKeys.imports(),
    queryFn: () => datamanagementService.listImports(),
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
  })
}

/**
 * Get an import job by ID
 */
export function useImportJob(id: string) {
  return useQuery({
    queryKey: dataManagementKeys.import(id),
    queryFn: () => datamanagementService.getImport(id),
    enabled: !!id,
    staleTime: 15 * 1000,
    gcTime: 5 * 60 * 1000,
  })
}

/**
 * List all export jobs
 */
export function useExportJobs() {
  return useQuery({
    queryKey: dataManagementKeys.exports(),
    queryFn: () => datamanagementService.listExports(),
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
  })
}

/**
 * Get an export job by ID
 */
export function useExportJob(id: string) {
  return useQuery({
    queryKey: dataManagementKeys.export(id),
    queryFn: () => datamanagementService.getExport(id),
    enabled: !!id,
    staleTime: 15 * 1000,
    gcTime: 5 * 60 * 1000,
  })
}

/**
 * Create a new import job
 */
export function useCreateImportJob() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateImportJobDto) =>
      datamanagementService.createImport(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: dataManagementKeys.imports() })
    },
  })
}

/**
 * Preview field mapping for an import
 */
export function usePreviewMapping() {
  return useMutation({
    mutationFn: (data: { entitytype: string; data: string }) =>
      datamanagementService.previewMapping(data),
  })
}

/**
 * Create a new export job
 */
export function useCreateExportJob() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateExportJobDto) =>
      datamanagementService.createExport(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: dataManagementKeys.exports() })
    },
  })
}

/**
 * Download the result of a completed export job
 */
export function useDownloadExport() {
  return useMutation({
    mutationFn: (id: string) => datamanagementService.downloadExport(id),
  })
}
