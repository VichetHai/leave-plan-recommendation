import {
    Button,
    DialogActionTrigger,
    DialogRoot,
    DialogTrigger,
    Input,
    Text,
    Textarea,
    VStack,
} from "@chakra-ui/react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useState } from "react"
import { type SubmitHandler, useForm } from "react-hook-form"
import { FaExchangeAlt } from "react-icons/fa"
import type { ApiError } from "@/client/core/ApiError"
import LeaveTypesService from "@/client/LeaveTypesService"
import { OpenAPI } from "@/client/core/OpenAPI"
import useCustomToast from "@/hooks/useCustomToast"
import { handleError } from "@/utils"
import {
    DialogBody,
    DialogCloseTrigger,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "../ui/dialog"
import { Field } from "../ui/field"
import { Select } from "../ui/select"

interface LeavePlanRequestPublic {
    id: string
    description: string
    leave_type_id: string
    owner_id: string
    approver_id: string
    requested_at: string
    approved_at: string | null
    status: string
    amount: number
    details: any[]
}

interface LeavePlanRequestUpdate {
    description?: string
    leave_type_id?: string
    details?: Array<{ leave_date: string }>
}

// Temporary service - will be replaced by auto-generated LeavePlanRequestsService
const LeavePlanRequestsService = {
    updateLeavePlanRequest: async ({
        id,
        requestBody,
    }: {
        id: string
        requestBody: LeavePlanRequestUpdate
    }) => {
        const baseUrl = OpenAPI.BASE || ""
        const token = localStorage.getItem("access_token") || ""
        const response = await fetch(`${baseUrl}/api/v1/leave-plan-requests/${id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(requestBody),
        })
        if (!response.ok) {
            throw new Error("Failed to update leave plan request")
        }
        return response.json()
    },
}

interface EditLeavePlanRequestProps {
    leavePlanRequest: LeavePlanRequestPublic
}

const EditLeavePlanRequest = ({ leavePlanRequest }: EditLeavePlanRequestProps) => {
    const [isOpen, setIsOpen] = useState(false)
    const queryClient = useQueryClient()
    const { showSuccessToast } = useCustomToast()
    const [leaveDate, setLeaveDate] = useState(
        leavePlanRequest.details?.[0]?.leave_date || ""
    )

    // Fetch leave types for dropdown
    const { data: leaveTypesData } = useQuery({
        queryKey: ["leave-types"],
        queryFn: () => LeaveTypesService.readLeaveTypes({ skip: 0, limit: 100 }),
    })

    const leaveTypes = leaveTypesData?.data || []
    const leaveTypeOptions = leaveTypes
        .filter(lt => lt.is_active)
        .map(lt => ({
            value: lt.id,
            label: lt.name,
        }))

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting },
    } = useForm<LeavePlanRequestUpdate>({
        mode: "onChange",
        criteriaMode: "all",
        defaultValues: {
            description: leavePlanRequest.description,
            leave_type_id: leavePlanRequest.leave_type_id,
        },
    })

    const mutation = useMutation({
        mutationFn: (data: LeavePlanRequestUpdate) =>
            LeavePlanRequestsService.updateLeavePlanRequest({
                id: leavePlanRequest.id,
                requestBody: data,
            }),
        onSuccess: () => {
            showSuccessToast("Leave plan request updated successfully.")
            reset()
            setIsOpen(false)
        },
        onError: (err: ApiError) => {
            handleError(err)
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ["leave-plan-requests"] })
        },
    })

    const onSubmit: SubmitHandler<LeavePlanRequestUpdate> = async (data) => {
        // Convert leave date string to details array
        const details = leaveDate
            ? [{ leave_date: leaveDate }]
            : []

        mutation.mutate({
            ...data,
            details,
        })
    }

    return (
        <DialogRoot
            size={{ base: "xs", md: "md" }}
            placement="center"
            open={isOpen}
            onOpenChange={({ open }) => setIsOpen(open)}
        >
            <DialogTrigger asChild>
                <Button variant="ghost" size="sm">
                    <FaExchangeAlt fontSize="16px" />
                    Edit Request
                </Button>
            </DialogTrigger>
            <DialogContent>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <DialogHeader>
                        <DialogTitle>Edit Leave Plan Request</DialogTitle>
                    </DialogHeader>
                    <DialogBody>
                        <Text mb={4}>Update the leave plan request details below.</Text>
                        <VStack gap={4}>
                            <Field
                                required
                                invalid={!!errors.description}
                                errorText={errors.description?.message}
                                label="Description"
                            >
                                <Textarea
                                    {...register("description", {
                                        required: "Description is required",
                                    })}
                                    placeholder="Reason for leave request"
                                    rows={3}
                                />
                            </Field>

                            <Field
                                required
                                invalid={!!errors.leave_type_id}
                                errorText={errors.leave_type_id?.message}
                                label="Leave Type"
                            >
                                <Select
                                    {...register("leave_type_id", {
                                        required: "Leave Type is required",
                                    })}
                                    options={leaveTypeOptions}
                                    placeholder="Select a leave type..."
                                />
                            </Field>

                            <Field
                                required
                                invalid={!leaveDate && isSubmitting}
                                errorText={!leaveDate && isSubmitting ? "Leave date is required" : undefined}
                                label="Leave Date"
                            >
                                <Input
                                    value={leaveDate}
                                    onChange={(e) => setLeaveDate(e.target.value)}
                                    placeholder="2025-10-25"
                                    type="date"
                                />
                            </Field>
                        </VStack>
                    </DialogBody>

                    <DialogFooter gap={2}>
                        <DialogActionTrigger asChild>
                            <Button
                                variant="subtle"
                                colorPalette="gray"
                                disabled={isSubmitting}
                            >
                                Cancel
                            </Button>
                        </DialogActionTrigger>
                        <Button variant="solid" type="submit" loading={isSubmitting}>
                            Save
                        </Button>
                    </DialogFooter>
                    <DialogCloseTrigger />
                </form>
            </DialogContent>
        </DialogRoot>
    )
}

export default EditLeavePlanRequest
