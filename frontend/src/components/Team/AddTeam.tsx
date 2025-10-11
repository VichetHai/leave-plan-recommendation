import { useState } from "react"
import { useEffect } from "react"
import { Controller, type SubmitHandler, useForm } from "react-hook-form"
import { FaPlus } from "react-icons/fa"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { TeamsService, TeamCreate } from "@/client/TeamsService"
import useCustomToast from "@/hooks/useCustomToast"
import { handleError } from "@/utils"
import { Button, Flex, Input, VStack } from "@chakra-ui/react"
import { Field } from "@/components/ui/field"
import { Checkbox } from "@/components/ui/checkbox"
import { DialogActionTrigger, DialogBody, DialogCloseTrigger, DialogContent, DialogFooter, DialogHeader, DialogRoot, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

const AddTeam = () => {
    const [isOpen, setIsOpen] = useState(false)
    const queryClient = useQueryClient()
    const { showSuccessToast } = useCustomToast()
    function generateUUID() {
        // RFC4122 version 4 compliant UUID generator
        return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
            const r = (Math.random() * 16) | 0,
                v = c === "x" ? r : (r & 0x3) | 0x8
            return v.toString(16)
        })
    }

    const {
        control,
        register,
        handleSubmit,
        reset,
        setValue,
        formState: { errors, isValid, isSubmitting },
    } = useForm<TeamCreate>({
        mode: "onChange",
        criteriaMode: "all",
        defaultValues: {
            name: "",
            description: "",
            team_owner_id: generateUUID(),
            is_active: true,
        },
    })

    // Regenerate UUID when dialog opens
    useEffect(() => {
        if (isOpen) {
            setValue("team_owner_id", generateUUID())
        }
    }, [isOpen, setValue])
    const mutation = useMutation({
        mutationFn: (data: TeamCreate) => TeamsService.createTeam({ requestBody: data }),
        onSuccess: () => {
            showSuccessToast("Team created successfully.")
            reset()
            setIsOpen(false)
        },
        onError: (err: any) => {
            handleError(err)
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ["teams"] })
        },
    })
    const onSubmit: SubmitHandler<TeamCreate> = (data) => {
        mutation.mutate(data)
    }
    return (
        <DialogRoot size={{ base: "xs", md: "md" }} placement="center" open={isOpen} onOpenChange={({ open }) => setIsOpen(open)}>
            <DialogTrigger asChild>
                <Button value="add-team" my={4}>
                    <FaPlus fontSize="16px" />
                    Add Team
                </Button>
            </DialogTrigger>
            <DialogContent>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <DialogHeader>
                        <DialogTitle>Add Team</DialogTitle>
                    </DialogHeader>
                    <DialogBody>
                        <VStack gap={4}>
                            <Field required invalid={!!errors.name} errorText={errors.name?.message} label="Name">
                                <Input {...register("name", { required: "Name is required" })} placeholder="Enter team name" type="text" />
                            </Field>
                            <Field required invalid={!!errors.description} errorText={errors.description?.message} label="Description">
                                <Input {...register("description", { required: "Description is required" })} placeholder="Enter description" type="text" />
                            </Field>
                            <Field required invalid={!!errors.team_owner_id} errorText={errors.team_owner_id?.message} label="Owner ID">
                                <Input {...register("team_owner_id", { required: "Owner ID is required" })} placeholder="Enter owner ID (uuid)" type="text" />
                            </Field>
                        </VStack>
                        <Flex mt={4} direction="column" gap={4}>
                            <Controller
                                control={control}
                                name="is_active"
                                render={({ field }) => (
                                    <Field disabled={field.disabled} colorPalette="teal">
                                        <Checkbox checked={field.value} onCheckedChange={({ checked }) => field.onChange(checked === true)}>
                                            Is active?
                                        </Checkbox>
                                    </Field>
                                )}
                            />
                        </Flex>
                    </DialogBody>
                    <DialogFooter gap={2}>
                        <DialogActionTrigger asChild>
                            <Button variant="subtle" colorPalette="gray" disabled={isSubmitting}>Cancel</Button>
                        </DialogActionTrigger>
                        <Button variant="solid" type="submit" disabled={!isValid} loading={isSubmitting}>Save</Button>
                    </DialogFooter>
                </form>
                <DialogCloseTrigger />
            </DialogContent>
        </DialogRoot>
    )
}
export default AddTeam;
