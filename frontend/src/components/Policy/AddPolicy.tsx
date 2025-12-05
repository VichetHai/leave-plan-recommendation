import {
    Button,
    DialogActionTrigger,
    DialogTitle,
    Flex,
    Input,
    Text,
    VStack,
} from "@chakra-ui/react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useState } from "react"
import { Controller, type SubmitHandler, useForm } from "react-hook-form"
import { FaPlus } from "react-icons/fa"
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
    DialogRoot,
    DialogTrigger,
} from "../ui/dialog"
import { Field } from "../ui/field"

// These types will be auto-generated once you regenerate the API client
// For now, defining them manually based on the API documentation
interface PolicyCreate {
    code: string
    name: string
    operator: string
    values: string
    scope: string
    scope_detail: string
    is_active: boolean
}

// Temporary service - will be replaced by auto-generated PoliciesService
const PoliciesService = {
    createPolicy: async ({ requestBody }: { requestBody: PolicyCreate }) => {
        const baseUrl = OpenAPI.BASE || ""
        const token = localStorage.getItem("access_token") || ""
        const response = await fetch(`${baseUrl}/api/v1/policies`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(requestBody),
        })
        if (!response.ok) {
            throw new Error("Failed to create policy")
        }
        return response.json()
    },
}

const AddPolicy = () => {
    const [isOpen, setIsOpen] = useState(false)
    const queryClient = useQueryClient()
    const { showSuccessToast } = useCustomToast()
    const {
        control,
        register,
        handleSubmit,
        reset,
        formState: { errors, isValid, isSubmitting },
    } = useForm<PolicyCreate>({
        mode: "onChange",
        criteriaMode: "all",
        defaultValues: {
            code: "",
            name: "",
            operator: "",
            values: "",
            scope: "",
            scope_detail: "",
            is_active: true,
        },
    })

    const mutation = useMutation({
        mutationFn: (data: PolicyCreate) =>
            PoliciesService.createPolicy({ requestBody: data }),
        onSuccess: () => {
            showSuccessToast("Policy created successfully.")
            reset()
            setIsOpen(false)
        },
        onError: (err: ApiError) => {
            handleError(err)
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ["policies"] })
        },
    })

    const onSubmit: SubmitHandler<PolicyCreate> = (data) => {
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
                <Button value="add-policy" my={4}>
                    <FaPlus fontSize="16px" />
                    Add Policy
                </Button>
            </DialogTrigger>
            <DialogContent>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <DialogHeader>
                        <DialogTitle>Add Policy</DialogTitle>
                    </DialogHeader>
                    <DialogBody>
                        <Text mb={4}>
                            Fill in the form below to add a new policy to the system.
                        </Text>
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
                                    placeholder="Policy code"
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
                                    placeholder="Policy name"
                                    type="text"
                                />
                            </Field>

                            <Field
                                required
                                invalid={!!errors.operator}
                                errorText={errors.operator?.message}
                                label="Operator"
                            >
                                <Input
                                    {...register("operator", {
                                        required: "Operator is required",
                                    })}
                                    placeholder="Operator (e.g., eq, gt, lt)"
                                    type="text"
                                />
                            </Field>

                            <Field
                                required
                                invalid={!!errors.values}
                                errorText={errors.values?.message}
                                label="Values"
                            >
                                <Input
                                    {...register("values", {
                                        required: "Values is required",
                                    })}
                                    placeholder="Policy values"
                                    type="text"
                                />
                            </Field>

                            <Field
                                required
                                invalid={!!errors.scope}
                                errorText={errors.scope?.message}
                                label="Scope"
                            >
                                <Input
                                    {...register("scope", {
                                        required: "Scope is required",
                                    })}
                                    placeholder="Policy scope"
                                    type="text"
                                />
                            </Field>

                            <Field
                                invalid={!!errors.scope_detail}
                                errorText={errors.scope_detail?.message}
                                label="Scope Detail"
                            >
                                <Input
                                    {...register("scope_detail")}
                                    placeholder="Scope detail (optional)"
                                    type="text"
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

export default AddPolicy
