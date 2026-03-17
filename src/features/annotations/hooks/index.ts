'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { annotationsService } from '../api/annotations-service'
import type {
  CreateAnnotationDto,
  UpdateAnnotationDto,
} from '@/core/contracts'

/**
 * Query key factory for annotations
 */
export const annotationKeys = {
  all: ['annotations'] as const,
  lists: () => [...annotationKeys.all, 'list'] as const,
  list: (params: Record<string, unknown>) =>
    [...annotationKeys.lists(), params] as const,
  details: () => [...annotationKeys.all, 'detail'] as const,
  detail: (id: string) => [...annotationKeys.details(), id] as const,
  byEntity: (objecttypecode: string, objectid: string) =>
    [...annotationKeys.all, 'entity', objecttypecode, objectid] as const,
}

/**
 * List annotations with optional filters
 */
export function useAnnotations(params?: {
  objectid?: string
  objecttypecode?: string
  search?: string
}) {
  return useQuery({
    queryKey: annotationKeys.list(params ?? {}),
    queryFn: () => annotationsService.list(params),
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
  })
}

/**
 * Get a single annotation by ID
 */
export function useAnnotation(id: string) {
  return useQuery({
    queryKey: annotationKeys.detail(id),
    queryFn: () => annotationsService.getById(id),
    enabled: !!id,
    staleTime: 60 * 1000,
    gcTime: 5 * 60 * 1000,
  })
}

/**
 * Get annotations for a specific entity (by type and ID)
 */
export function useAnnotationsByEntity(
  objecttypecode: string,
  objectid: string
) {
  return useQuery({
    queryKey: annotationKeys.byEntity(objecttypecode, objectid),
    queryFn: () => annotationsService.listByEntity(objecttypecode, objectid),
    enabled: !!objecttypecode && !!objectid,
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
  })
}

/**
 * Create a new annotation
 */
export function useCreateAnnotation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateAnnotationDto) => annotationsService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: annotationKeys.all })
    },
  })
}

/**
 * Update an existing annotation
 */
export function useUpdateAnnotation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateAnnotationDto }) =>
      annotationsService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: annotationKeys.all })
    },
  })
}

/**
 * Delete an annotation
 */
export function useDeleteAnnotation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => annotationsService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: annotationKeys.all })
    },
  })
}
