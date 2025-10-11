import {
    Button,
    DialogActionTrigger,
    DialogRoot,
    DialogTrigger,
    Flex,
    Input,
    Text,
    Textarea,
    VStack,
} from "@chakra-ui/react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useState } from "react"
import { Controller, type SubmitHandler, useForm } from "react-hook-form"
import { FaExchangeAlt } from "react-icons/fa"
import type { ApiError } from "@/client/core/ApiError"
import { OpenAPI } from "@/client/core/OpenAPI"
import useCustomToast from "@/hooks/useCustomToast"
import { handleError } from "@/utils"
import { Checkbox } from "../ui/checkbox"
import {
    DialogBody,
    DialogCloseTrigger,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "../ui/dialog"
import { Field } from "../ui/field"

interface LeaveTypePublic {
    code: string
    name: string
    description: string
    is_active: boolean
    id: string
}

interface LeaveTypeUpdate {
    code?: string
    name?: string
    description?: string
    is_active?: boolean
}

const LeaveTypesService = {
    updateLeaveType: async ({
        id,
        requestBody,
    }: {
        id: string
        requestBody: LeaveTypeUpdate
    }) => {
        const baseUrl = OpenAPI.BASE || ""
        const token = localStorage.getItem("access_token") || ""
        const response = await fetch(`${baseUrl}/api/v1/leave-types/${id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(requestBody),
        })
        if (!response.ok) {
            throw new Error("Failed to update leave type")
        }
        return response.json()
    },
}

interface EditLeaveTypeProps {
    leaveType: LeaveTypePublic
}

const EditLeaveType = ({ leaveType }: EditLeaveTypeProps) => {
    const [isOpen, setIsOpen] = useState(false)
    const queryClient = useQueryClient()
    const { showSuccessToast } = useCustomToast()
    const {
        control,
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting },
    } = useForm<LeaveTypeUpdate>({
        mode: "onChange",
        criteriaMode: "all",
        defaultValues: {
            code: leaveType.code,
            name: leaveType.name,
            description: leaveType.description,
            is_active: leaveType.is_active,
        },
    })

    const mutation = useMutation({
        mutationFn: (data: LeaveTypeUpdate) =>
            LeaveTypesService.updateLeaveType({ id: leaveType.id, requestBody: data }),
        onSuccess: () => {
            showSuccessToast("Leave type updated successfully.")
            reset()
            setIsOpen(false)
        },
        onError: (err: ApiError) => {
            handleError(err)
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ["leave-types"] })
        },
    })

    const onSubmit: SubmitHandler<LeaveTypeUpdate> = async (data) => {
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
                    Edit Leave Type
                </Button>
            </DialogTrigger>
            <DialogContent>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <DialogHeader>
                        <DialogTitle>Edit Leave Type</DialogTitle>
                    </DialogHeader>
                    <DialogBody>
                        <Text mb={4}>Update the leave type details below.</Text>
                        <VStack gap={4}>
                            <Field
                                required
                                invalid={!!errors.code}
                                errorText={errors.code?.message}
                                label="Code"
                            >
                                <Input
                                    {...register("code", {
                                        required: "Code is required",
                                    })}
                                    placeholder="Leave type code"
                                    type="text"
                                />
                            </Field>

                            <Field
                                required
                                invalid={!!errors.name}
                                errorText={errors.name?.message}
                                label="Name"
                            >
                                <Input
                                    {...register("name", {
                                        required: "Name is required",
                                    })}
                                    placeholder="Leave type name"
                                    type="text"
                                />
                            </Field>

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
                                    placeholder="Leave type description"
                                    rows={4}
                                />
                            </Field>
                        </VStack>

                        <Flex mt={4} direction="column" gap={4}>
                            <Controller
                                control={control}
                                name="is_active"
                                render={({ field }) => (
                                    <Field disabled={field.disabled} colorPalette="teal">
                                        <Checkbox
                                            checked={field.value}
                                            onCheckedChange={({ checked }) => field.onChange(checked === true)}
                                        >
                                            Is active?
                                        </Checkbox>
                                    </Field>
                                )}
                            />
                        </Flex>
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

export default EditLeaveType
