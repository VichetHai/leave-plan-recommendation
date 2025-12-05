import { Badge, Box, Container, Flex, Heading, Table, Text } from "@chakra-ui/react"
import { useQuery } from "@tanstack/react-query"
import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { useState } from "react"
import { z } from "zod"
import AddLeaveRequest from "@/components/LeaveRequest/AddLeaveRequest"
import { LeaveRequestActionsMenu } from "@/components/Common/LeaveRequestActionsMenu"
import PendingLeaveRequests from "@/components/Pending/PendingLeaveRequests"
import {
    PaginationItems,
    PaginationNextTrigger,
    PaginationPrevTrigger,
    PaginationRoot,
} from "@/components/ui/pagination.tsx"
import { OpenAPI } from "@/client/core/OpenAPI"
import {
    DialogBody,
    DialogCloseTrigger,
    DialogContent,
    DialogHeader,
    DialogRoot,
    DialogTitle,
} from "@/components/ui/dialog"

interface LeaveTypeInfo {
    id: string
    name: string
    code: string
}

interface ApproverInfo {
    id: string
    name: string
}

interface LeaveRequestPublic {
    id: string
    start_date: string
    end_date: string
    description: string
    leave_type_id: string
    owner_id: string
    approver_id: string | null
    requested_at: string
    submitted_at: string | null
    approval_at: string | null
    status: string
    full_name: string
    leave_type: LeaveTypeInfo
    approver: ApproverInfo[]
}

interface LeaveRequestsResponse {
    data: LeaveRequestPublic[]
    count: number
}

// Temporary service - will be replaced by auto-generated LeaveRequestsService
const LeaveRequestsService = {
    readLeaveRequests: async ({
        skip,
        limit,
    }: {
        skip?: number
        limit?: number
    }): Promise<LeaveRequestsResponse> => {
        const params = new URLSearchParams()
        if (skip !== undefined) params.append("skip", skip.toString())
        if (limit !== undefined) params.append("limit", limit.toString())

        const baseUrl = OpenAPI.BASE || ""
        const token = localStorage.getItem("access_token") || ""
        const response = await fetch(`${baseUrl}/api/v1/leave-requests?${params}`, {
            headers: { Authorization: `Bearer ${token}` },
        })
        if (!response.ok) {
            throw new Error("Failed to fetch leave requests")
        }
        return response.json()
    },
}

const leaveRequestsSearchSchema = z.object({
    page: z.number().catch(1),
})

const PER_PAGE = 10

function getLeaveRequestsQueryOptions({ page }: { page: number }) {
    return {
        queryFn: () =>
            LeaveRequestsService.readLeaveRequests({
                skip: (page - 1) * PER_PAGE,
                limit: PER_PAGE,
            }),
        queryKey: ["leave-requests", { page }],
    }
}

export const Route = createFileRoute("/_layout/leave-requests")({
    component: LeaveRequests,
    validateSearch: (search) => leaveRequestsSearchSchema.parse(search),
})

// Popup component to show owner_id when clicking on name
function NameWithPopover({ name, ownerId }: { name: string; ownerId: string }) {
    const [isOpen, setIsOpen] = useState(false)

    return (
        <DialogRoot
            size="xs"
            placement="center"
            open={isOpen}
            onOpenChange={({ open }) => setIsOpen(open)}
        >
            <Box
                as="span"
                cursor="pointer"
                _hover={{ textDecoration: "underline", color: "blue.500" }}
                onClick={() => setIsOpen(true)}
            >
                {name}
            </Box>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Owner Details</DialogTitle>
                </DialogHeader>
                <DialogBody pb={4}>
                    <Text fontWeight="bold" mb={1}>Name:</Text>
                    <Text mb={3}>{name}</Text>
                    <Text fontWeight="bold" mb={1}>Owner ID:</Text>
                    <Text fontSize="sm" color="gray.600" wordBreak="break-all">{ownerId}</Text>
                </DialogBody>
                <DialogCloseTrigger />
            </DialogContent>
        </DialogRoot>
    )
}

// Popup component to show approver IDs when clicking on approver names
function ApproverWithPopover({ approvers }: { approvers: ApproverInfo[] }) {
    const [isOpen, setIsOpen] = useState(false)

    if (!approvers || approvers.length === 0) {
        return <Text>-</Text>
    }

    const approverNames = approvers.map((a) => a.name).join(", ")

    return (
        <DialogRoot
            size="xs"
            placement="center"
            open={isOpen}
            onOpenChange={({ open }) => setIsOpen(open)}
        >
            <Box
                as="span"
                cursor="pointer"
                _hover={{ textDecoration: "underline", color: "blue.500" }}
                onClick={() => setIsOpen(true)}
            >
                {approverNames}
            </Box>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Approver Details</DialogTitle>
                </DialogHeader>
                <DialogBody pb={4}>
                    {approvers.map((approver, index) => (
                        <Box key={approver.id} mb={index < approvers.length - 1 ? 3 : 0}>
                            <Text fontWeight="bold" mb={1}>Name:</Text>
                            <Text mb={2}>{approver.name}</Text>
                            <Text fontWeight="bold" mb={1}>Approver ID:</Text>
                            <Text fontSize="sm" color="gray.600" wordBreak="break-all">{approver.id}</Text>
                        </Box>
                    ))}
                </DialogBody>
                <DialogCloseTrigger />
            </DialogContent>
        </DialogRoot>
    )
}

// Popup component to show id when clicking on description
function DescriptionWithPopover({ description, id }: { description: string; id: string }) {
    const [isOpen, setIsOpen] = useState(false)

    return (
        <DialogRoot
            size="xs"
            placement="center"
            open={isOpen}
            onOpenChange={({ open }) => setIsOpen(open)}
        >
            <Box
                as="span"
                cursor="pointer"
                _hover={{ textDecoration: "underline", color: "blue.500" }}
                onClick={() => setIsOpen(true)}
            >
                {description || "-"}
            </Box>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Leave Request Details</DialogTitle>
                </DialogHeader>
                <DialogBody pb={4}>
                    <Text fontWeight="bold" mb={1}>Description:</Text>
                    <Text mb={3}>{description || "-"}</Text>
                    <Text fontWeight="bold" mb={1}>ID:</Text>
                    <Text fontSize="sm" color="gray.600" wordBreak="break-all">{id}</Text>
                </DialogBody>
                <DialogCloseTrigger />
            </DialogContent>
        </DialogRoot>
    )
}

function LeaveRequestsTable() {
    const navigate = useNavigate({ from: Route.fullPath })
    const { page } = Route.useSearch()

    const { data, isLoading, isPlaceholderData } = useQuery({
        ...getLeaveRequestsQueryOptions({ page }),
        placeholderData: (prevData) => prevData,
    })

    const setPage = (page: number) => {
        navigate({ to: "/leave-requests", search: (prev) => ({ ...prev, page }) })
    }

    const requests = data?.data.slice(0, PER_PAGE) ?? []
    const count = data?.count ?? 0

    if (isLoading) {
        return <PendingLeaveRequests />;
    }

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case "approved":
                return "green"
            case "submitted":
                return "yellow"
            case "rejected":
                return "red"
            default:
                return "gray"
        }
    }

    // Calculate amount of days between start and end date (inclusive)
    const calculateDays = (startDate: string, endDate: string) => {
        const start = new Date(startDate)
        const end = new Date(endDate)
        const diffTime = Math.abs(end.getTime() - start.getTime())
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1
        return diffDays
    }

    return (
        <>
            <Table.Root size={{ base: "sm", md: "md" }}>
                <Table.Header>
                    <Table.Row>
                        <Table.ColumnHeader w="md">Description</Table.ColumnHeader>
                        <Table.ColumnHeader w="sm">Name</Table.ColumnHeader>
                        <Table.ColumnHeader w="sm">Leave Type</Table.ColumnHeader>
                        <Table.ColumnHeader w="sm">Start</Table.ColumnHeader>
                        <Table.ColumnHeader w="sm">End</Table.ColumnHeader>
                        <Table.ColumnHeader w="sm">Amount</Table.ColumnHeader>
                        <Table.ColumnHeader w="sm">Approver</Table.ColumnHeader>
                        <Table.ColumnHeader w="sm">Status</Table.ColumnHeader>
                        <Table.ColumnHeader w="sm">Submitted At</Table.ColumnHeader>
                        <Table.ColumnHeader w="sm">Approval At</Table.ColumnHeader>
                        <Table.ColumnHeader w="sm">Actions</Table.ColumnHeader>
                    </Table.Row>
                </Table.Header>
                <Table.Body>
                    {requests?.map((req) => (
                        <Table.Row key={req.id} opacity={isPlaceholderData ? 0.5 : 1}>
                            <Table.Cell truncate maxW="md">
                                <DescriptionWithPopover
                                    description={req.description}
                                    id={req.id}
                                />
                            </Table.Cell>
                            <Table.Cell truncate maxW="sm">
                                <NameWithPopover
                                    name={req.full_name || "-"}
                                    ownerId={req.owner_id}
                                />
                            </Table.Cell>
                            <Table.Cell truncate maxW="sm">{req.leave_type?.name || req.leave_type_id}</Table.Cell>
                            <Table.Cell>{new Date(req.start_date).toLocaleDateString()}</Table.Cell>
                            <Table.Cell>{new Date(req.end_date).toLocaleDateString()}</Table.Cell>
                            <Table.Cell>{calculateDays(req.start_date, req.end_date)} days</Table.Cell>
                            <Table.Cell truncate maxW="sm">
                                <ApproverWithPopover approvers={req.approver} />
                            </Table.Cell>
                            <Table.Cell>
                                <Badge colorPalette={getStatusColor(req.status)}>
                                    {req.status}
                                </Badge>
                            </Table.Cell>
                            <Table.Cell>
                                {req.submitted_at
                                    ? new Date(req.submitted_at).toLocaleDateString()
                                    : "-"}
                            </Table.Cell>
                            <Table.Cell>
                                {req.approval_at
                                    ? new Date(req.approval_at).toLocaleDateString()
                                    : "-"}
                            </Table.Cell>
                            <Table.Cell>
                                <LeaveRequestActionsMenu leaveRequest={req} />
                            </Table.Cell>
                        </Table.Row>
                    ))}
                </Table.Body>
            </Table.Root>
            <Flex justifyContent="flex-end" mt={4}>
                <PaginationRoot
                    count={count}
                    pageSize={PER_PAGE}
                    onPageChange={({ page }) => setPage(page)}
                >
                    <Flex>
                        <PaginationPrevTrigger />
                        <PaginationItems />
                        <PaginationNextTrigger />
                    </Flex>
                </PaginationRoot>
            </Flex>
        </>
    )
}

function LeaveRequests() {
    return (
        <Container maxW="full">
            <Heading size="lg" pt={12}>
                Leave Requests Management
            </Heading>
            <AddLeaveRequest />
            <LeaveRequestsTable />
        </Container>
    )
}
