import {
    Button,
    DialogActionTrigger,
    DialogTitle,
    Input,
    Text,
    Textarea,
    VStack,
} from "@chakra-ui/react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useState } from "react"
import { type SubmitHandler, useForm } from "react-hook-form"
import { FaPlus } from "react-icons/fa"
import type { ApiError } from "@/client/core/ApiError"
import { OpenAPI } from "@/client/core/OpenAPI"
import useCustomToast from "@/hooks/useCustomToast"
import { handleError } from "@/utils"
import {
    DialogBody,
    DialogCloseTrigger,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogRoot,
    DialogTrigger,
} from "../ui/dialog"
import { Field } from "../ui/field"

interface LeavePlanRequestCreate {
    description: string
    leave_type_id: string
    details: Array<{ leave_date: string }>
}

// Temporary service - will be replaced by auto-generated LeavePlanRequestsService
const LeavePlanRequestsService = {
    createLeavePlanRequest: async ({
        requestBody,
    }: {
        requestBody: LeavePlanRequestCreate
    }) => {
        const baseUrl = OpenAPI.BASE || ""
        const token = localStorage.getItem("access_token") || ""
        const response = await fetch(`${baseUrl}/api/v1/leave-plan-requests`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(requestBody),
        })
        if (!response.ok) {
            throw new Error("Failed to create leave plan request")
        }
        return response.json()
    },
}

const AddLeavePlanRequest = () => {
    const [isOpen, setIsOpen] = useState(false)
    const queryClient = useQueryClient()
    const { showSuccessToast } = useCustomToast()
    const [leaveDate, setLeaveDate] = useState("")

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isValid, isSubmitting },
    } = useForm<LeavePlanRequestCreate>({
        mode: "onChange",
        criteriaMode: "all",
        defaultValues: {
            description: "",
            leave_type_id: "",
            details: [],
        },
    })

    const mutation = useMutation({
        mutationFn: (data: LeavePlanRequestCreate) =>
            LeavePlanRequestsService.createLeavePlanRequest({ requestBody: data }),
        onSuccess: () => {
            showSuccessToast("Leave plan request created successfully.")
            reset()
            setLeaveDate("")
            setIsOpen(false)
        },
        onError: (err: ApiError) => {
            handleError(err)
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ["leave-plan-requests"] })
        },
    })

    const onSubmit: SubmitHandler<LeavePlanRequestCreate> = (data) => {
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
            onOpenChange={({ open }) => {
                setIsOpen(open)
                if (!open) {
                    reset()
                    setLeaveDate("")
                }
            }}
        >
            <DialogTrigger asChild>
                <Button value="add-leave-plan-request" my={4}>
                    <FaPlus fontSize="16px" />
                    Add Leave Plan Request
                </Button>
            </DialogTrigger>
            <DialogContent>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <DialogHeader>
                        <DialogTitle>Add Leave Plan Request</DialogTitle>
                    </DialogHeader>
                    <DialogBody>
                        <Text mb={4}>
                            Fill in the form below to create a new leave plan request.
                        </Text>
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
                                label="Leave Type ID"
                            >
                                <Input
                                    {...register("leave_type_id", {
                                        required: "Leave Type ID is required",
                                    })}
                                    placeholder="Leave type UUID"
                                    type="text"
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
                        <Button
                            variant="solid"
                            type="submit"
                            disabled={!isValid || !leaveDate}
                            loading={isSubmitting}
                        >
                            Save
                        </Button>
                    </DialogFooter>
                </form>
                <DialogCloseTrigger />
            </DialogContent>
        </DialogRoot>
    )
}

export default AddLeavePlanRequest
