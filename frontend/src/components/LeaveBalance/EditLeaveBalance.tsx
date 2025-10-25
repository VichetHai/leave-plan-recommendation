import {
    Button,
    DialogActionTrigger,
    DialogRoot,
    DialogTrigger,
    Input,
    Text,
    VStack,
} from "@chakra-ui/react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useState } from "react"
import { type SubmitHandler, useForm } from "react-hook-form"
import { FaExchangeAlt } from "react-icons/fa"
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
    DialogTitle,
} from "../ui/dialog"
import { Field } from "../ui/field"

interface LeaveBalancePublic {
    id: string
    year: string
    balance: number
    leave_type_id: string
    owner_id: string
}

interface LeaveBalanceUpdate {
    year?: string
    balance?: number
    leave_type_id?: string
    owner_id?: string
}

// Temporary service - will be replaced by auto-generated LeaveBalancesService
const LeaveBalancesService = {
    updateLeaveBalance: async ({
        id,
        requestBody,
    }: {
        id: string
        requestBody: LeaveBalanceUpdate
    }) => {
        const baseUrl = OpenAPI.BASE || ""
        const token = localStorage.getItem("access_token") || ""
        const response = await fetch(`${baseUrl}/api/v1/leave-balances/${id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(requestBody),
        })
        if (!response.ok) {
            throw new Error("Failed to update leave balance")
        }
        return response.json()
    },
}

interface EditLeaveBalanceProps {
    leaveBalance: LeaveBalancePublic
}

const EditLeaveBalance = ({ leaveBalance }: EditLeaveBalanceProps) => {
    const [isOpen, setIsOpen] = useState(false)
    const queryClient = useQueryClient()
    const { showSuccessToast } = useCustomToast()
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting },
    } = useForm<LeaveBalanceUpdate>({
        mode: "onChange",
        criteriaMode: "all",
        defaultValues: {
            year: leaveBalance.year,
            balance: leaveBalance.balance,
            leave_type_id: leaveBalance.leave_type_id,
            owner_id: leaveBalance.owner_id,
        },
    })

    const mutation = useMutation({
        mutationFn: (data: LeaveBalanceUpdate) =>
            LeaveBalancesService.updateLeaveBalance({ id: leaveBalance.id, requestBody: data }),
        onSuccess: () => {
            showSuccessToast("Leave balance updated successfully.")
            reset()
            setIsOpen(false)
        },
        onError: (err: ApiError) => {
            handleError(err)
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ["leave-balances"] })
        },
    })

    const onSubmit: SubmitHandler<LeaveBalanceUpdate> = async (data) => {
        mutation.mutate(data)
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
                    Edit Leave Balance
                </Button>
            </DialogTrigger>
            <DialogContent>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <DialogHeader>
                        <DialogTitle>Edit Leave Balance</DialogTitle>
                    </DialogHeader>
                    <DialogBody>
                        <Text mb={4}>Update the leave balance details below.</Text>
                        <VStack gap={4}>
                            <Field
                                required
                                invalid={!!errors.year}
                                errorText={errors.year?.message}
                                label="Year"
                            >
                                <Input
                                    {...register("year", {
                                        required: "Year is required",
                                    })}
                                    placeholder="2025"
                                    type="text"
                                />
                            </Field>

                            <Field
                                required
                                invalid={!!errors.balance}
                                errorText={errors.balance?.message}
                                label="Balance"
                            >
                                <Input
                                    {...register("balance", {
                                        required: "Balance is required",
                                        valueAsNumber: true,
                                    })}
                                    placeholder="15"
                                    type="number"
                                    step="0.5"
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
                                invalid={!!errors.owner_id}
                                errorText={errors.owner_id?.message}
                                label="Owner ID"
                            >
                                <Input
                                    {...register("owner_id", {
                                        required: "Owner ID is required",
                                    })}
                                    placeholder="User UUID"
                                    type="text"
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

export default EditLeaveBalance
