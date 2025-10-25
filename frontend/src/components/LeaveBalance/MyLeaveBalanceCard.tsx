import { Badge, Card, Flex, Heading, Skeleton, Text, VStack } from "@chakra-ui/react"
import { useQuery } from "@tanstack/react-query"
import { OpenAPI } from "@/client/core/OpenAPI"

interface LeaveBalancePublic {
    id: string
    year: string
    balance: number
    leave_type_id: string
    owner_id: string
}

// Temporary service - will be replaced by auto-generated LeaveBalancesService
const LeaveBalancesService = {
    readMyLeaveBalance: async (): Promise<LeaveBalancePublic> => {
        const baseUrl = OpenAPI.BASE || ""
        const token = localStorage.getItem("access_token") || ""
        const response = await fetch(`${baseUrl}/api/v1/leave-balances/me`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        })
        if (!response.ok) {
            throw new Error("Failed to fetch my leave balance")
        }
        return response.json()
    },
}

/**
 * MyLeaveBalanceCard - Display current user's leave balance
 * 
 * This component can be used on the dashboard or anywhere you need
 * to show the current user's leave balance.
 * 
 * Usage:
 * ```tsx
 * import MyLeaveBalanceCard from "@/components/LeaveBalance/MyLeaveBalanceCard"
 * 
 * function Dashboard() {
 *   return (
 *     <Container>
 *       <MyLeaveBalanceCard />
 *     </Container>
 *   )
 * }
 * ```
 */
const MyLeaveBalanceCard = () => {
    const { data: leaveBalance, isLoading, error } = useQuery({
        queryKey: ["my-leave-balance"],
        queryFn: LeaveBalancesService.readMyLeaveBalance,
    })

    if (error) {
        return (
            <Card.Root>
                <Card.Body>
                    <VStack gap={2} alignItems="flex-start">
                        <Heading size="md">My Leave Balance</Heading>
                        <Text color="red.500">
                            Unable to load leave balance. Please try again later.
                        </Text>
                    </VStack>
                </Card.Body>
            </Card.Root>
        )
    }

    return (
        <Card.Root>
            <Card.Body>
                <VStack gap={4} alignItems="flex-start">
                    <Heading size="md">My Leave Balance</Heading>

                    {isLoading ? (
                        <VStack gap={2} w="full">
                            <Skeleton height="20px" width="150px" />
                            <Skeleton height="40px" width="100px" />
                        </VStack>
                    ) : (
                        <>
                            <Flex gap={2} alignItems="center">
                                <Text fontSize="sm" color="gray.500">
                                    Year:
                                </Text>
                                <Badge colorPalette="blue">{leaveBalance?.year}</Badge>
                            </Flex>

                            <Flex direction="column" gap={1}>
                                <Text fontSize="sm" color="gray.500">
                                    Available Days:
                                </Text>
                                <Text fontSize="3xl" fontWeight="bold">
                                    <Badge
                                        colorPalette={
                                            (leaveBalance?.balance ?? 0) > 0 ? "green" : "red"
                                        }
                                        fontSize="2xl"
                                        px={4}
                                        py={2}
                                    >
                                        {leaveBalance?.balance ?? 0}
                                    </Badge>
                                </Text>
                            </Flex>
                        </>
                    )}
                </VStack>
            </Card.Body>
        </Card.Root>
    )
}

export default MyLeaveBalanceCard
