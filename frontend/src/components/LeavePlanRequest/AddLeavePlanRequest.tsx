import {
    Button,
    DialogActionTrigger,
    DialogTitle,
    Input,
    Text,
    Textarea,
    VStack,
    IconButton,
    Flex,
} from "@chakra-ui/react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useState } from "react"
import { type SubmitHandler, useForm } from "react-hook-form"
import { FaPlus, FaTrash } from "react-icons/fa"
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
    DialogRoot,
    DialogTrigger,
} from "../ui/dialog"
import { Field } from "../ui/field"
import { Select } from "../ui/select"

interface LeavePlanRequestCreate {
    description: string
    leave_type_id: string
}

interface LeavePlanRequestPayload extends LeavePlanRequestCreate {
    details: Array<{ leave_date: string }>
}

// Temporary service - will be replaced by auto-generated LeavePlanRequestsService
const LeavePlanRequestsService = {
    createLeavePlanRequest: async ({
        requestBody,
    }: {
            requestBody: LeavePlanRequestPayload
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
    const [leaveDates, setLeaveDates] = useState<string[]>([])
    const [newDate, setNewDate] = useState("")

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
        formState: { errors, isValid, isSubmitting },
    } = useForm<LeavePlanRequestCreate>({
        mode: "onChange",
        criteriaMode: "all",
        defaultValues: {
            description: "",
            leave_type_id: "",
        },
    })

    const handleAddDate = () => {
        if (newDate && !leaveDates.includes(newDate)) {
            setLeaveDates([...leaveDates, newDate])
            setNewDate("")
        }
    }

    const handleRemoveDate = (dateToRemove: string) => {
        setLeaveDates(leaveDates.filter(date => date !== dateToRemove))
    }

    const handleReset = () => {
        reset()
        setLeaveDates([])
        setNewDate("")
    }

    const mutation = useMutation({
        mutationFn: (data: LeavePlanRequestPayload) =>
            LeavePlanRequestsService.createLeavePlanRequest({ requestBody: data }),
        onSuccess: () => {
            showSuccessToast("Leave plan request created successfully.")
            handleReset()
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
        // Convert leaveDates array to details format
        const details = leaveDates.map(date => ({ leave_date: date }))
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
                    handleReset()
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
                                invalid={leaveDates.length === 0 && isSubmitting}
                                errorText={leaveDates.length === 0 && isSubmitting ? "At least one leave date is required" : undefined}
                                label="Leave Dates *"
                            >
                                <VStack gap={3} align="stretch">
                                    {/* Input for adding new date */}
                                    <Flex gap={2}>
                                        <Input
                                            value={newDate}
                                            onChange={(e) => setNewDate(e.target.value)}
                                            type="date"
                                            placeholder="Select date"
                                            flex={1}
                                        />
                                        <Button
                                            size="md"
                                            variant="outline"
                                            onClick={handleAddDate}
                                            disabled={!newDate}
                                        >
                                            <FaPlus fontSize="16px" /> Add Date
                                        </Button>
                                    </Flex>

                                    {/* List of added dates */}
                                    {leaveDates.length > 0 && (
                                        <VStack gap={2} align="stretch">
                                            {leaveDates.map((date, idx) => (
                                                <Flex
                                                    key={idx}
                                                    align="center"
                                                    gap={2}
                                                    p={2}
                                                    borderWidth="1px"
                                                    borderRadius="md"
                                                    bg="gray.50"
                                                >
                                                    <Text flex={1}>
                                                        {new Date(date).toLocaleDateString("en-GB", {
                                                            day: "2-digit",
                                                            month: "2-digit",
                                                            year: "numeric"
                                                        })}
                                                    </Text>
                                                    <IconButton
                                                        aria-label="Remove date"
                                                        children={<FaTrash fontSize="16px" />}
                                                        size="sm"
                                                        colorPalette="red"
                                                        onClick={() => handleRemoveDate(date)}
                                                    />
                                                </Flex>
                                            ))}
                                        </VStack>
                                    )}
                                </VStack>
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
                            disabled={!isValid || leaveDates.length === 0}
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
