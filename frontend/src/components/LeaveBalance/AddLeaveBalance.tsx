import {
    Button,
    DialogActionTrigger,
    DialogTitle,
    Input,
    Text,
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

interface LeaveBalanceCreate {
    year: string
    balance: number
    leave_type_id: string
    owner_id: string
}

// Temporary service - will be replaced by auto-generated LeaveBalancesService
const LeaveBalancesService = {
    createLeaveBalance: async ({ requestBody }: { requestBody: LeaveBalanceCreate }) => {
        const baseUrl = OpenAPI.BASE || ""
        const token = localStorage.getItem("access_token") || ""
        const response = await fetch(`${baseUrl}/api/v1/leave-balances`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(requestBody),
        })
        if (!response.ok) {
            throw new Error("Failed to create leave balance")
        }
        return response.json()
    },
}

const AddLeaveBalance = () => {
    const [isOpen, setIsOpen] = useState(false)
    const queryClient = useQueryClient()
    const { showSuccessToast } = useCustomToast()
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isValid, isSubmitting },
    } = useForm<LeaveBalanceCreate>({
        mode: "onChange",
        criteriaMode: "all",
        defaultValues: {
            year: new Date().getFullYear().toString(),
            balance: 0,
            leave_type_id: "",
            owner_id: "",
        },
    })

    const mutation = useMutation({
        mutationFn: (data: LeaveBalanceCreate) =>
            LeaveBalancesService.createLeaveBalance({ requestBody: data }),
        onSuccess: () => {
            showSuccessToast("Leave balance created successfully.")
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

    const onSubmit: SubmitHandler<LeaveBalanceCreate> = (data) => {
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
                <Button value="add-leave-balance" my={4}>
                    <FaPlus fontSize="16px" />
                    Add Leave Balance
                </Button>
            </DialogTrigger>
            <DialogContent>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <DialogHeader>
                        <DialogTitle>Add Leave Balance</DialogTitle>
                    </DialogHeader>
                    <DialogBody>
                        <Text mb={4}>
                            Fill in the form below to add a new leave balance.
                        </Text>
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
                        <Button
                            variant="solid"
                            type="submit"
                            disabled={!isValid}
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

export default AddLeaveBalance
